#!/usr/bin/env python3
"""
cloud_render.py — Local CLI to dispatch & download GitHub Actions cloud renders
for Three.js 1080x1920 30 fps 3D cartoon shorts (zero rendering load on laptop).

Commands:
  python cloud_render.py check
  python cloud_render.py init [--repo cartoon-short-cloud-render] [--public]
  python cloud_render.py stills <project> [--frames "0,45,120"]
  python cloud_render.py full <project> [--shards 4] [--workers 3] [--title "My Short"] [--no-subtitles]
  python cloud_render.py status
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WORKFLOW_FILE = "render.yml"


def find_bin(name: str) -> str:
    found = shutil.which(name)
    if found:
        return found
    fallbacks = {
        "git": [
            r"C:\Program Files\Git\cmd\git.exe",
            r"C:\Program Files (x86)\Git\cmd\git.exe",
        ],
        "gh": [
            r"C:\Program Files\GitHub CLI\gh.exe",
            os.path.expandvars(r"%LOCALAPPDATA%\GitHub CLI\gh.exe"),
        ],
    }
    for cand in fallbacks.get(name, []):
        if os.path.exists(cand):
            return cand
    raise FileNotFoundError(f"Could not find `{name}` on PATH or standard install locations.")


GIT = find_bin("git")
GH = find_bin("gh")

# Ensure child processes (like `gh` invoking `git` or git invoking `gh` credential helper) find both on PATH
_extra_paths = [str(Path(GIT).parent), str(Path(GH).parent)]
os.environ["PATH"] = os.pathsep.join(_extra_paths) + os.pathsep + os.environ.get("PATH", "")


def run(cmd, cwd=ROOT, check=True, capture=False):
    if capture:
        return subprocess.run(cmd, cwd=cwd, check=check, text=True, capture_output=True)
    return subprocess.run(cmd, cwd=cwd, check=check)


def ensure_auth():
    r = run([GH, "auth", "status"], check=False, capture=True)
    if r.returncode != 0:
        print("GitHub CLI is not authenticated yet.", file=sys.stderr)
        print("Run: gh auth login --web --git-protocol https", file=sys.stderr)
        sys.exit(2)
    return r.stdout + r.stderr


def ensure_git_identity():
    name = run([GIT, "config", "--get", "user.name"], check=False, capture=True).stdout.strip()
    email = run([GIT, "config", "--get", "user.email"], check=False, capture=True).stdout.strip()
    if not name or not email:
        login = run([GH, "api", "user", "--jq", ".login"], capture=True).stdout.strip()
        if not name:
            run([GIT, "config", "user.name", login or "cartoon-render-bot"])
        if not email:
            run([GIT, "config", "user.email", f"{login}@users.noreply.github.com"])


def sync_and_push(message: str):
    ensure_git_identity()
    run([GIT, "add", "-A"])
    status = run([GIT, "status", "--porcelain"], capture=True).stdout.strip()
    if status:
        run([GIT, "commit", "-m", message])
    branch = run([GIT, "rev-parse", "--abbrev-ref", "HEAD"], capture=True).stdout.strip()
    print(f"Pushing to GitHub ({branch})...")
    run([GIT, "push", "-u", "origin", branch])


def dispatch_and_wait(inputs: dict, artifact_name: str, download_dir: Path):
    # Record latest existing run ID before dispatch
    before = run(
        [GH, "run", "list", "--workflow", WORKFLOW_FILE, "--limit", "1", "--json", "databaseId"],
        capture=True,
    ).stdout.strip()
    prev_id = None
    try:
        arr = json.loads(before)
        if arr:
            prev_id = arr[0]["databaseId"]
    except Exception:
        pass

    cmd = [GH, "workflow", "run", WORKFLOW_FILE]
    for k, v in inputs.items():
        if v is not None and v != "":
            cmd += ["-f", f"{k}={v}"]
    print("Dispatching GitHub Actions cloud render:", " ".join(cmd))
    run(cmd)

    # Poll briefly until the newly created workflow run appears
    run_id = None
    for _ in range(30):
        time.sleep(2)
        out = run(
            [GH, "run", "list", "--workflow", WORKFLOW_FILE, "--limit", "5", "--json", "databaseId,status,createdAt,displayTitle"],
            capture=True,
        ).stdout.strip()
        runs = json.loads(out) if out else []
        for item in runs:
            if item["databaseId"] != prev_id:
                run_id = item["databaseId"]
                break
        if run_id:
            break

    if not run_id:
        print("ERROR: Could not detect new workflow run ID.", file=sys.stderr)
        sys.exit(1)

    print(f"Cloud render run started: #{run_id}")
    url = run([GH, "run", "view", str(run_id), "--json", "url", "--jq", ".url"], capture=True).stdout.strip()
    print(f"Live URL: {url}")

    # Watch until completion
    watch = run([GH, "run", "watch", str(run_id), "--exit-status"], check=False)
    if watch.returncode != 0:
        print(f"\nCloud render #{run_id} FAILED! Fetching failure logs...", file=sys.stderr)
        run([GH, "run", "view", str(run_id), "--log-failed"], check=False)
        sys.exit(watch.returncode)

    if download_dir.exists():
        shutil.rmtree(download_dir)
    download_dir.mkdir(parents=True, exist_ok=True)
    print(f"\nDownloading artifact `{artifact_name}` -> {download_dir}")
    run([GH, "run", "download", str(run_id), "-n", artifact_name, "-D", str(download_dir)])
    print("\nCloud render complete! Downloaded files:")
    for p in sorted(download_dir.rglob("*")):
        if p.is_file():
            print(f"  - {p} ({p.stat().st_size:,} bytes)")


def cmd_check(_args):
    print("git:", run([GIT, "--version"], capture=True).stdout.strip())
    print("gh :", run([GH, "--version"], capture=True).stdout.splitlines()[0])
    print(ensure_auth())


def cmd_init(args):
    ensure_auth()
    if not (ROOT / ".git").exists():
        run([GIT, "init", "-b", "main"])
    ensure_git_identity()
    run([GIT, "add", "-A"])
    if run([GIT, "status", "--porcelain"], capture=True).stdout.strip():
        run([GIT, "commit", "-m", "Initial Three.js 3D cartoon cloud render studio"])

    remotes = run([GIT, "remote"], capture=True).stdout.split()
    if "origin" not in remotes:
        vis = "--public" if args.public else "--private"
        print(f"Creating GitHub repository `{args.repo}` ({vis})...")
        run([GH, "repo", "create", args.repo, vis, "--source", str(ROOT), "--remote", "origin", "--push"])
    else:
        run([GIT, "push", "-u", "origin", "main"])
    print("GitHub cloud render repository is live and ready!")


def cmd_stills(args):
    ensure_auth()
    proj = ROOT / "projects" / args.project
    if not (proj / "web").exists():
        print(f"ERROR: Project not found: {proj}", file=sys.stderr)
        sys.exit(1)
    sync_and_push(f"Sync {args.project} for stills audit")
    inputs = {"project": args.project, "mode": "stills", "workers": str(args.workers)}
    if args.frames:
        inputs["frames_override"] = args.frames
    out_dir = ROOT / "downloads" / args.project / "stills"
    dispatch_and_wait(inputs, f"stills-audit-{args.project}", out_dir)


def cmd_full(args):
    ensure_auth()
    proj = ROOT / "projects" / args.project
    if not (proj / "web").exists():
        print(f"ERROR: Project not found: {proj}", file=sys.stderr)
        sys.exit(1)
    sync_and_push(f"Sync {args.project} for full 1080x1920 30fps cloud render")
    inputs = {
        "project": args.project,
        "mode": "full",
        "shards": str(args.shards),
        "workers": str(args.workers),
        "title": args.title or args.project,
        "subtitles": "false" if args.no_subtitles else "true",
    }
    out_dir = ROOT / "downloads" / args.project / "final"
    dispatch_and_wait(inputs, f"final-video-{args.project}", out_dir)


def cmd_status(_args):
    ensure_auth()
    run([GH, "run", "list", "--workflow", WORKFLOW_FILE, "--limit", "10"])


def main():
    p = argparse.ArgumentParser(description="GitHub Actions Cloud Renderer for Three.js 3D Cartoon Shorts")
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("check", help="Check git, gh, and GitHub authentication")

    p_init = sub.add_parser("init", help="Create GitHub repo and push cloud render workflow")
    p_init.add_argument("--repo", default="cartoon-short-cloud-render")
    p_init.add_argument("--public", action="store_true", help="Create as public repo (unlimited free Actions minutes)")

    p_stills = sub.add_parser("stills", help="Cloud-render 1 still per shot -> stills_audit.jpg")
    p_stills.add_argument("project")
    p_stills.add_argument("--frames", default="", help="Optional frame spec override")
    p_stills.add_argument("--workers", type=int, default=3)

    p_full = sub.add_parser("full", help="Cloud-render full 1080x1920 30fps MP4 with parallel sharding")
    p_full.add_argument("project")
    p_full.add_argument("--shards", type=int, default=4, help="Parallel GitHub Actions runners (1-8)")
    p_full.add_argument("--workers", type=int, default=3, help="Parallel Chromium workers per runner")
    p_full.add_argument("--title", default="")
    p_full.add_argument("--no-subtitles", action="store_true")

    sub.add_parser("status", help="Show recent cloud render runs")

    args = p.parse_args()
    {"check": cmd_check, "init": cmd_init, "stills": cmd_stills, "full": cmd_full, "status": cmd_status}[args.cmd](args)


if __name__ == "__main__":
    main()
