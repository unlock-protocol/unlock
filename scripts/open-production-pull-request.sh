#!/usr/bin/env bash

echo "Installing github hub"
cd ..
wget https://github.com/github/hub/releases/download/v2.11.2/hub-linux-amd64-2.11.2.tgz
tar -xvf hub-linux-amd64-2.11.2.tgz


cd project

# This script gets the git history as by default CircleCI will only get the most recent commit.
echo "Fetching git history"
git config --replace-all remote.origin.fetch +refs/heads/*:refs/remotes/origin/*
git fetch >> /dev/null

echo "Setting up git"
git config --global user.email "ops@unlock-protocol.com"
git config --global user.name "Unlock Deployer"

echo "Checking master out 4 days ago into new branch"
STABLE_MASTER=`git rev-list -1 --before={4.days.ago} master`
BRANCH="production-$(date +%Y%m%d-%H%M%S)"
git checkout -b $BRANCH $STABLE_MASTER

echo "Diffing versus latest production"
LATEST_PRODUCTION=`git rev-parse origin/production`
git reset --soft $LATEST_PRODUCTION

echo "Committing diff"
COMMIT_MESSAGE="Automated deploy between $LATEST_PRODUCTION and $STABLE_MASTER"
git commit -m "$COMMIT_MESSAGE" -a --no-verify

echo "Push new production branch"
git push origin $BRANCH --no-verify

echo "Open pull request"
PR_TITLE="Production Automated Deploy $BRANCH"

GITHUB_TOKEN=$GITHUB_API_TOKEN ./../hub-linux-amd64-2.11.2/bin/hub pull-request -b production -h $BRANCH

# curl --fail -u $GITHUB_API_USER:$GITHUB_API_TOKEN -H "Content-Type:application/json" -X POST -d "{\"title\":\"$PR_TITLE\",\"base\":\"production\",\"head\":\"$BRANCH\"}" https://api.github.com/repos/unlock-protocol/unlock/pulls



