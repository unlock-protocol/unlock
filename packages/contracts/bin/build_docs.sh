#! /bin/sh
SRC_DOCS_FOLDER="$(pwd)/docs"
DEST_DOCS_FOLDER="$(pwd)/docs-reorg"

# build docs
yarn hardhat dodoc

# delete existing folder
rm -rf $DEST_DOCS_FOLDER
mkdir -p $DEST_DOCS_FOLDER

# first archive all 
cp -R $SRC_DOCS_FOLDER $DEST_DOCS_FOLDER
mv $DEST_DOCS_FOLDER/docs $DEST_DOCS_FOLDER/archive
rm -rf $DEST_DOCS_FOLDER/archive/col

# docusaurus titles
echo '{
  "label": "Protocol Reference",
  "position": 3
}' > "$DEST_DOCS_FOLDER/_category_.json"
echo '{
  "label": "Past Versions"
}' > "$DEST_DOCS_FOLDER/archive/_category_.json"

# find latest versions
latest_template=$(ls $SRC_DOCS_FOLDER/PublicLock/IPublicLockV* | sed -e 's/[^0-9][^0-9]*\([0-9][0-9]*\).*/\1/g' | sort -nr | head -n1)
latest_unlock=$(ls $SRC_DOCS_FOLDER/Unlock/IUnlockV* | sed -e 's/[^0-9][^0-9]*\([0-9][0-9]*\).*/\1/g' | sort -nr | head -n1)

# get latest versions out of archive folder
mv "$DEST_DOCS_FOLDER/archive/PublicLock/IPublicLockV${latest_template}.md" "$DEST_DOCS_FOLDER/PublicLock.md"
mv "$DEST_DOCS_FOLDER/archive/Unlock/IUnlockV${latest_unlock}.md" "$DEST_DOCS_FOLDER/Unlock.md"

# change titles
sed -i -e "s/IPublicLockV${latest_template}/PublicLock (v${latest_template})/g" "$DEST_DOCS_FOLDER/PublicLock.md"
sed -i -e "s/IUnlockV${latest_unlock}/Unlock (v${latest_unlock})/g" "$DEST_DOCS_FOLDER/Unlock.md"

### add README
echo '# Protocol Reference

This section of the docs is generated automatically from the smart contracts themselves. 
You can find out more about contributing [here](https://github.com/unlock-protocol/unlock).
' > "$DEST_DOCS_FOLDER/README.md"

# docusaurus titles
echo '{
  "label": "Protocol Reference",
  "position": 3
}' > "$DEST_DOCS_FOLDER/_category_.json"
echo '{
  "label": "Past Versions"
}' > "$DEST_DOCS_FOLDER/archive/_category_.json"

# replace docs
rm -rf $SRC_DOCS_FOLDER
mv $DEST_DOCS_FOLDER $SRC_DOCS_FOLDER

