#! /bin/sh

# ==============================================================================
# This script is used to copy openapi.yml to the docs site.
#
# Usage:
# scripts/docs-locksmith-pr.sh
#
# ==============================================================================

# use tmp dir
here=$(pwd)
tmpdir=$(mktemp -d)
dest="openapi.yml"
base="master"
repo=git@github.com:unlock-protocol/docs.git

# versioning
version_number=$(yarn workspace @unlock-protocol/locksmith version:show)
branch=networks-$version_number
echo $branch

# cleanup
cd $tmpdir

# git worflow
git clone $repo
cd docs

# check if a branch already exists
if $(git ls-remote --heads ${repo} ${branch} | grep ${branch} >/dev/null); then
    echo "Branch ${branch} already exists, pushing to existing branch"
    git fetch origin
    git checkout $branch
else
    git checkout $base
    git checkout -b $branch
fi

# generate new docs files
cd $here
sh -c "cp locksmith/openapi.yml $tmpdir/docs/$dest"

# # commit changes
cd $tmpdir/docs
message="Openapi info generated from @unlock-protocol/locksmith@${version_number}"
git add .
git commit -a -m"$message"
git push origin $branch

# create PR on github
gh pr create --head "$branch" \
    --base "$base" \
    --title "$message" \
    --body "This PR updates openapi.yml file from the unlock-monorepo."
