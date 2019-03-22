stat build || mkdir build

if [ -z "$1" ]
  then
    archive='../builds/locksmith.zip'
  else
     archive=${1}
fi

# Archive artifacts
zip ${archive} -r build package.json package-lock.json