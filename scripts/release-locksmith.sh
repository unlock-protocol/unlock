set -ex
# SET THE FOLLOWING VARIABLES
# docker hub username
USERNAME=unlockprotocol
IMAGE=locksmith

version=`cat ../locksmith/VERSION`
echo "version: $version"

./build.sh
docker tag $USERNAME/$IMAGE:latest $USERNAME/$IMAGE:$version
# push it
docker push $USERNAME/$IMAGE:latest
docker push $USERNAME/$IMAGE:$version