# Bluesky Comments Integration Setup

This directory contains scripts for automatically posting blog posts to Bluesky and integrating Bluesky comments into your Hugo site.

## Files

- `post-to-bluesky.sh` - Main script that posts to Bluesky and updates front matter
- `pre-commit` - Git hook template that runs the script before commits

## Setup Instructions

### 1. Configure Environment Variables

Copy the template file to create your `.env` file:

```bash
cp scripts/env.template .env
# Or if you prefer it in the blog directory:
cp scripts/env.template blog/.env
```

Then edit the `.env` file and fill in your credentials:

```bash
BSKY_HANDLE=your-handle.bsky.social
BSKY_APP_PASSWORD=your-app-password-here
BLOG_BASE_URL=https://mirokeimioniemi.com/writing
```

To get your Bluesky app password:
1. Go to https://bsky.app/settings/app-passwords
2. Create a new app password
3. Copy it to your `.env` file

### 2. Install the Pre-commit Hook

Copy the pre-commit hook to your `.git/hooks/` directory:

```bash
cp scripts/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Or create it manually:

```bash
#!/bin/bash
./scripts/post-to-bluesky.sh
git add blog/content/**/*.md 2>/dev/null || true
```

Make sure it's executable:
```bash
chmod +x .git/hooks/pre-commit
```

### 3. Make the Script Executable

```bash
chmod +x scripts/post-to-bluesky.sh
```

## How It Works

1. When you commit new or modified markdown files in:
   - `blog/content/blog/`
   - `blog/content/creative-writing/`
   - `blog/content/academic-writing/`

2. The pre-commit hook runs `post-to-bluesky.sh`

3. The script:
   - Detects new/modified posts
   - Checks if they already have a `bsky` field (skips if present)
   - Posts to Bluesky with format: `"{title} {post_url}"`
   - Updates the post's front matter with the Bluesky URL
   - Stages the updated files

4. The commit proceeds with the updated front matter

5. On your blog, the Bluesky post serves as the comment section

## Requirements

- Bash (Git Bash on Windows, native on macOS/Linux)
- `curl` (usually pre-installed)
- Git

The script uses simple grep/sed for JSON parsing, so no additional tools needed!

## Troubleshooting

- **Script not running**: Make sure the hook is executable and in `.git/hooks/pre-commit`
- **Authentication errors**: Check your `.env` file has correct credentials
- **API errors**: Bluesky API might be down or rate-limited - check the error message
- **Front matter not updating**: Check file permissions and YAML syntax



ENV TEMPLATE

# Bluesky API Credentials
# Get your app password from: https://bsky.app/settings/app-passwords

# Your Bluesky handle (e.g., mirokeimioniemi.bsky.social or @mirokeimioniemi.bsky.social)
BSKY_HANDLE=your-handle.bsky.social

# Your Bluesky app password (create one at the link above)
BSKY_APP_PASSWORD=your-app-password-here

# Your blog's base URL (optional - defaults to https://mirokeimioniemi.com/writing)
BLOG_BASE_URL=https://mirokeimioniemi.com/writing