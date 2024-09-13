#! /bin/sh

# Exit on error
set -e

# ==============================================================================
# This script is used to generate the documentation for the contracts.
# It will : 1) build the docs from the contracts package and 2) opens a PR in the repo
#
# Usage:
# scripts/docs-contracts-pr.sh
# ==============================================================================

# use tmp dir
tmpdir=$(mktemp -d)
pwd=`pwd`
dest="$pwd/docs/docs/core-protocol/smart-contracts-api"
src="$pwd/packages/contracts/dist/docs"
base="master" 

# get contracts tarball
yarn workspace @unlock-protocol/contracts clean
yarn workspace @unlock-protocol/contracts build
yarn workspace @unlock-protocol/contracts build:docs

# versioning
branch="$(cd packages/contracts && jq -r .version package.json | sed 's/\./-/g')"

# check if a branch already exists
if $(git show-ref --quiet ${branch}); then 
  echo "Branch ${branch} already exists, pushing to existing branch"; 
  git fetch origin $branch
  git checkout $branch
else
  git checkout $base
  git checkout -b $branch
fi

# copy new docs files over
rm -rf $dest
cp -R $src $dest

# commit changes
message="Contract API docs generated from @unlock-protocol/contracts@${branch}"
git add .
git commit -a -m"$message"
git push origin $branch

# create PR on github
gh pr create --head "$branch" \
  --base "$base"  \
  --title "$message" \
  --body "This PR adds the latest version of contracts docs, generated from contracts doctrings"
