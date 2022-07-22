#!/usr/bin/env bash

set -e

# get the timestamp of the latests commit to be deployed
COMMIT_TO_DEPLOY=`git rev-list -1 --before={2.days.ago} master`
COMMIT_TO_DEPLOY_TIMESTAMP=`git show -s --format=%ct $COMMIT_TO_DEPLOY`

# Get the timestamp of the latest commit deployed
# For this we need to parse the commit message of the latest production commit
# IMPORTANT: all of our commits on production need to have the latest commit from master which they deploy
# using the following format: commit:<SHA1>.
# Automated deploys will not work if we are not able to get that commit.

LATEST_PRODUCTION_COMMIT_MESSAGE=`git log -1 origin/production --pretty=%B`
COMMIT_REGEX="commit:([0-9a-f]{40})"

if [[ $LATEST_PRODUCTION_COMMIT_MESSAGE =~ $COMMIT_REGEX ]]
then
  LATEST_COMMIT_ID_IN_PRODUCTION="${BASH_REMATCH[1]}"
else
  echo "Skipping automated deployment. Latest production does not include commit sha1 (this is to avoid deploying an older version of master)."
  exit 0
fi

LATEST_PRODUCTION_TIMESTAMP=`git show -s --format=%ct $LATEST_COMMIT_ID_IN_PRODUCTION`

if [[ $((COMMIT_TO_DEPLOY_TIMESTAMP)) < $((LATEST_PRODUCTION_TIMESTAMP)) ]]
then
  COMMIT_TO_DEPLOY_DATE=`date -d @$COMMIT_TO_DEPLOY_TIMESTAMP`
  LATEST_PRODUCTION_DATE=`date -d @$LATEST_PRODUCTION_TIMESTAMP`
  echo "Latest production ($LATEST_PRODUCTION: $LATEST_PRODUCTION_DATE) is more recent than stable master ($COMMIT_TO_DEPLOY: $COMMIT_TO_DEPLOY_DATE) : skipping deployment."
  exit 0
fi

COMMIT_MESSAGE="Automated deploy as of commit:$COMMIT_TO_DEPLOY"

BRANCH="production-$(date +%Y%m%d-%H%M%S)"

DOY=$(date +%j)
declare -a REVIEWERS
REVIEWERS=( julien51 clemsos searchableguy kalidiagne )
REVIEWER_INDEX=$(($DOY % ${#REVIEWERS[@]}))
REVIEWER=${REVIEWERS[$REVIEWER_INDEX]}

echo '["'$COMMIT_MESSAGE'","'$BRANCH'","'$REVIEWER'"]'

# # Checking master out at COMMIT_TO_DEPLOY
# git checkout -b $BRANCH $COMMIT_TO_DEPLOY

# # Diffing versus latest production
# LATEST_PRODUCTION=`git rev-parse origin/production`
# git reset --soft $LATEST_PRODUCTION