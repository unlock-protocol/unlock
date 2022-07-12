#! /bin/sh

# ==============================================================================
# This script is used to generate the documentation for the networks.
# It will : 1) generate a list of networks from the existing package in this repo 
# and 2) opens a PR in the docs repo
#
# Usage:
# scripts/docs-networks-pr.sh
#
# ==============================================================================

# use tmp dir
here=$(pwd)
tmpdir=$(mktemp -d)
dest="docs/core-protocol/unlock/networks.md"
base="master"
repo=git@github.com:unlock-protocol/docs.git

# cleanup
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
