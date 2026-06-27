const { execSync } = require('child_process');

// Try to get GitHub token from credential manager
let token = process.env.GITHUB_TOKEN || '';
let username = 'Luludad33';

if (!token) {
  try {
    const out = execSync('git credential fill', {
      input: 'protocol=https\nhost=github.com\n\n'
    });
    const lines = out.toString().split('\n');
    for (const l of lines) {
      if (l.startsWith('password=')) token = l.slice(9);
      if (l.startsWith('username=')) username = l.slice(9);
    }
  } catch (e) {
    console.log('No stored credentials found.');
  }
}

if (!token) {
  console.log(`
Need a GitHub token. Since you have gh installed (wrong package):

Option 1 — Quick (recommended):
  Run this in your terminal (type it):
  !gh auth login

Option 2 — Use a token:
  1. Go to https://github.com/settings/tokens
  2. Generate a classic token with 'repo' scope
  3. Set it: SET GITHUB_TOKEN=ghp_xxx
  `);
  process.exit(1);
}

// Create repo via GitHub API
async function main() {
  const res = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'claude-setup'
    },
    body: JSON.stringify({
      name: '20-20-20护眼',
      description: '20-20-20护眼助手 - Electron桌面版',
      private: false,
      auto_init: false
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`API Error ${res.status}: ${err}`);
    process.exit(1);
  }

  const repo = await res.json();
  console.log(`✅ Repository created: ${repo.html_url}`);

  // Push code
  execSync('git remote add origin ' + repo.clone_url, { cwd: repoDir });
  execSync('git branch -M main', { cwd: repoDir });
  execSync('git push -u origin main', { cwd: repoDir });
  console.log('✅ Code pushed successfully!');
}

const repoDir = 'C:/Users/wty18/Desktop/CC/20-20-20护眼';
main().catch(e => console.error(e.message));
