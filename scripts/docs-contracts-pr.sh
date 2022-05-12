#! /bin/sh

# use tmp dir
tmpdir=$(mktemp -d)
dest="docs/developers/smart-contracts/contracts-api"
FROM_NPM=1

# get contracts tarball
if [ "$FROM_NPM" -eq "0" ]; then
  yarn workspace @unlock-protocol/contracts pack --out "$tmpdir/contracts-%v.tgz"
else
  wget $(npm view @unlock-protocol/contracts dist.tarball) -P $tmpdir
fi

# unpack tarball
cd $tmpdir
tar -xf contracts-**.tgz

# clone docs repo
git clone git@github.com:unlock-protocol/docs.git

# versioning
version_number="$(ls *.tgz | awk -F \- {'print substr($2,0,5) '} | sed 's/\./-/g')"
branch=docs-$version_number
rm -rf *.tgz

# copy doc files over
rm -rf $dest
cp -R package/dist/docs $dest
rm -rf package

# push to git
cd docs
git checkout -b $branch
message="Contract API docs generated from @unlock-protocol/contracts@${version_number}"
git add .
git commit -a -m"$message"
git push origin $branch

# create PR on github
gh pr create --head "$branch" \
  --base master  \
  --title "$message" \
  --body "This PR adds the latest version of contracts docs, generated from contracts doctrings"