#!/usr/bin/env python3
"""Create GitHub repo and push code."""
import subprocess, os, sys, json, urllib.request, base64, getpass

REPO_NAME = "20-20-20护眼"

# Try to get token from git credential manager
try:
    result = subprocess.run(
        ["git", "credential", "fill"],
        input=b"protocol=https\nhost=github.com\n\n",
        capture_output=True, timeout=5
    )
    creds = {}
    for line in result.stdout.decode().strip().split("\n"):
        if "=" in line:
            k, v = line.split("=", 1)
            creds[k] = v
    token = creds.get("password", "")
    username = creds.get("username", "Luludad33")
except:
    username = "Luludad33"
    token = ""

if not token:
    print("Need GitHub token to create repository.")
    print("Get one at: https://github.com/settings/tokens (repo scope)")
    print("Then re-run this script or set GITHUB_TOKEN env var.")
    token = os.environ.get("GITHUB_TOKEN", "")

if not token:
    print("\nNo token found. Creating repo via browser instead.")
    print(f"Please visit:")
    print(f"  https://github.com/new")
    print(f"  Repository name: {REPO_NAME}")
    print(f"  Set to Private if desired, then click Create")
    sys.exit(1)

# Create repo via API
req = urllib.request.Request(
    "https://api.github.com/user/repos",
    data=json.dumps({
        "name": REPO_NAME,
        "description": "20-20-20护眼助手 - Electron桌面版",
        "private": False,
        "auto_init": False
    }).encode(),
    headers={
        "Authorization": f"token {token}",
        "Content-Type": "application/json",
        "User-Agent": "create-repo-script"
    }
)

try:
    resp = urllib.request.urlopen(req)
    result = json.loads(resp.read())
    repo_url = result["clone_url"]
    print(f"Repository created: {repo_url}")

    # Push
    os.chdir("C:/Users/wty18/Desktop/CC/20-20-20护眼")
    subprocess.run(["git", "remote", "add", "origin", repo_url], check=True)
    subprocess.run(["git", "branch", "-M", "main"], check=True)
    # Set credential helper for push
    subprocess.run(["git", "push", "-u", "origin", "main"], check=True)
    print("Pushed successfully!")
except urllib.error.HTTPError as e:
    print(f"API Error: {e.code} - {e.read().decode()}")
except subprocess.CalledProcessError as e:
    print(f"Git error: {e}")
