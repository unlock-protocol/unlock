#! /bin/sh

# ==============================================================================
# This script is used to generate the documentation for the networks.
# It will : 1) fetch the package from npm and 2) opens a PR in the docs repo
#
# Usage:
# scripts/docs-contracts-pr.sh
#
# If you want to use the local package from `packages/networks` instead of 
# the one from npm, use the following:
# FROM_NPM=0 scripts/docs-networks-pr.sh
# ==============================================================================

# use tmp dir
# tmpdir=$(mktemp -d)
here=$(pwd)
tmpdir=$(pwd)/tmp-test
dest="docs/core-protocol/unlock/networks.md"
base="master" # "css-update"
repo=git@github.com:unlock-protocol/docs.git

# cleanup
rm -rf $tmpdir
mkdir $tmpdir
cd $tmpdir

# versioning
version_number=$(yarn workspace @unlock-protocol/networks version:show)
branch=networks-$version_number
echo $branch

# git worflow
git clone $repo
cd docs

# check if a branch already exists
if $(git ls-remote --heads ${repo} ${branch} | grep ${branch} >/dev/null); then 
echo "Branch ${branch} already exists, pushing to existing branch"; 
git fetch origin $branch
git checkout $branch
else
git checkout $base
git checkout -b $branch
fi

# generate new docs files
cd $here
sh -c "yarn workspace @unlock-protocol/networks doc" > $tmpdir/docs/$dest

# # commit changes
cd $tmpdir/docs
message="Networks info generated from @unlock-protocol/networks@${version_number}"
git add .
git commit -a -m"$message"
git push origin $branch

# create PR on github
gh pr create --head "$branch" \
  --base "$base"  \
  --title "$message" \
  --body "This PR adds the latest info about networks - generated from the package."
