#!/usr/bin/env bash

# This script gets the git history as by default CircleCI will only get the most recent commit.
git config --replace-all remote.origin.fetch +refs/heads/*:refs/remotes/origin/*
git fetch >> /dev/null

echo "Checking out 4 days ago"
git checkout `git rev-list -1 --before={4.days.ago} master`

echo "Creating new production branch"
BRANCH="production-$(date +%Y%m%d-%H%M%S)"
git checkout -b $BRANCH

echo "Push new production branch"
git push origin $BRANCH

echo "Open pull request"
PR_TITLE="Production Automated Deploy $BRANCH"
curl --fail -u $GITHUB_API_USER:$GITHUB_API_TOKEN -H "Content-Type:application/json" -X POST -d "{\"title\":\"$PR_TITLE\",\"base\":\"production\",\"head\":\"$BRANCH\"}" https://api.github.com/repos/unlock-protocol/unlock/pulls
