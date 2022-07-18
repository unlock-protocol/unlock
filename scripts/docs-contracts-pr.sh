#! /bin/sh

# ==============================================================================
# This script is used to generate the documentation for the contracts.
# It will : 1) fetch the package from npm and 2) opens a PR in the docs repo
#
# Usage:
# scripts/docs-contracts-pr.sh
#
# If you want to use the local package from `packages/contracts` instead of 
# the one from npm, use the following:
# FROM_NPM=0 scripts/docs-contracts-pr.sh
# ==============================================================================

# use tmp dir
tmpdir=$(mktemp -d)
dest="docs/core-protocol/smart-contracts-api"
base="master" # "css-update"
repo=git@github.com:unlock-protocol/docs.git
FROM_NPM=${FROM_NPM:-1}

# get contracts tarball
if [ "$FROM_NPM" -eq "0" ]; then
  yarn workspace @unlock-protocol/contracts pack --out "$tmpdir/contracts-%v.tgz"
else
  wget $(npm view @unlock-protocol/contracts dist.tarball) -P $tmpdir
fi

# unpack tarball
cd $tmpdir
tar -xf contracts-**.tgz

# versioning
version_number="$(ls *.tgz | awk -F \- {'print substr($2,0,5) '} | sed 's/\./-/g')"
branch=contracts-$version_number
rm -rf *.tgz

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

# copy new docs files over
rm -rf $dest
cp -R ../package/dist/docs $dest
rm -rf ../package

# commit changes
message="Contract API docs generated from @unlock-protocol/contracts@${version_number}"
git add .
git commit -a -m"$message"
git push origin $branch

# create PR on github
gh pr create --head "$branch" \
  --base "$base"  \
  --title "$message" \
  --body "This PR adds the latest version of contracts docs, generated from contracts doctrings"
