#! /bin/sh

# use tmp dir
cd $(mktemp -d)

# clone docs repo
git clone git@github.com:unlock-protocol/docs.git
cd docs/developers/smart-contracts
rm -rf contracts-api
mkdir contracts-api
cd contracts-api

# get tarball from npm
wget $(npm view @unlock-protocol/contracts dist.tarball)
tar -xf unlock-protocol-contracts-**.tgz

# copy doc files over
cp -R package/dist/docs .

# create branch
version_number="$(ls *.tgz | awk -F \- {'print substr($2,0,5) '} | sed 's/\./-/g')"
branch=docs-$version_number
git checkout -b $branch

# push commit to branch
message="Contract API docs generated from @unlock-protocol/contracts@${version_number}"
git commit -a -m $message
git push origin $branch

# create PR
gh pr create --head $branch --title $message --base master