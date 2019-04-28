#!/usr/bin/env bash

# This script gets the git history as by default CircleCI will only get the most recent commit.
echo "Fetching git history"
git config --replace-all remote.origin.fetch +refs/heads/*:refs/remotes/origin/*
git fetch >> /dev/null

STABLE_MASTER=`git rev-list -1 --before={4.days.ago} master`
LATEST_PRODUCTION=`git rev-parse origin/production`
STABLE_MASTER_DATE=`git show -s --format=%ct $STABLE_MASTER`
LATEST_PRODUCTION_DATE=`git show -s --format=%ct $LATEST_PRODUCTION`

if [[ $((STABLE_MASTER_DATE)) < $((LATEST_PRODUCTION_DATE)) ]]
then
  echo "Latest production ($LATEST_PRODUCTION: $LATEST_PRODUCTION_DATE) is more recent than stable master ($STABLE_MASTER: $LATEST_PRODUCTION_DATE) : skipping deployment."
  exit 0
fi

echo "Installing github hub"
cd ..
wget https://github.com/github/hub/releases/download/v2.11.2/hub-linux-amd64-2.11.2.tgz
tar -xvf hub-linux-amd64-2.11.2.tgz
cd project


echo "Setting up git"
git config --global user.email "ops@unlock-protocol.com"
git config --global user.name "Unlock Deployer"

echo "Checking master out 4 days ago into new branch"
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
MESSAGE="Production Automated Deploy $BRANCH

This is a production deployment. Please treat with great caution!
This deploys the code from master as of commit $STABLE_MASTER.

Reviewing code for this Pull Request is not practical, however, you are asked to check wether the current staging environment is stable and could be released. For this, follow these steps:

* [ ] Go to http://staging.unlock-protocol.com/ and ensure that the website loads fine.

## Creator Dashboard
* [ ] Click on the \"Go to your Dashboard\" button and ensure that the dashboard loads as expected
* [ ] Create a new Lock (you will need some Rinkeby Eth) and wait for it to confirm with the right values
* [ ] Update the price on this new lock or an older lock

## Paywall
* [ ] Go to https://www.ouvre-boite.com/members-staging/ and make sure the paywall is in place (no scrolling)
* [ ] Purchase a key and ensure that the optimistic paywall lets you access the content (scrolling works)
* [ ] Wait 5 minutes (the key should expire) and reload the page
* [ ] Purchase another key

Feel free to test the dashboard and paywal using a mobile browser.
"

DOY=$(date +%j)
declare -a REVIEWERS
REVIEWERS=( julien51 cnasc cellog akeem benwerd )
REVIEWER_INDEX=$(($DOY % ${#REVIEWERS[@]}))

GITHUB_TOKEN=$GITHUB_API_TOKEN ./../hub-linux-amd64-2.11.2/bin/hub pull-request -b production -h $BRANCH --message "$MESSAGE" -r ${REVIEWERS[$REVIEWER_INDEX]}

git checkout master
