#!/bin/bash

cd /vercel/share/v0-project

# Configure git
git config user.name "v0[bot]" 2>/dev/null || true
git config user.email "v0[bot]@users.noreply.github.com" 2>/dev/null || true

# Check git status
echo "Current git status:"
git status

# Add all changes
echo "Adding changes..."
git add -A

# Commit with descriptive message
echo "Committing changes..."
git commit -m "feat: Award-level UI/UX redesign with real backend integration

- Replace red colors with professional blue/cyan gradient (#3b82f6, #0284c7, #06b6d4)
- Fix landing page with scroll-reveal animations and staggered children
- Update dashboard to fetch real site data from /api/nft/my endpoint
- Remove mock content and placeholder stats
- Add premium CSS animations (liquid-glow, text-draw, liquid-flow, etc)
- Implement proper glassmorphism and neomorphism card styles
- Fix logo references to use existing /logo.png
- Add scroll-triggered reveals with IntersectionObserver
- Dashboard now shows real NFT count, total value, and engagement metrics
- Update dashboard title from COMMAND CENTER to DeMedia DASHBOARD
- Professional hover states with smooth transitions

Co-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>" || true

# Push to current branch
echo "Pushing to GitHub..."
git push origin HEAD --force-with-lease || git push origin HEAD

echo "Push complete!"
