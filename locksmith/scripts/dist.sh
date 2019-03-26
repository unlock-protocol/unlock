mkdir -p build && mkdir -p builds

if [ -z "$1" ]
  then
    archive='../builds/locksmith.zip'
  else
     archive=${1}
fi

# Archive artifacts
pushd 'build'
zip ${archive} -r . ../package.json ../package-lock.json
popd