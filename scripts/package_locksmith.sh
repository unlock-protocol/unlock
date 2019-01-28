#!/usr/bin/env bash

mkdir builds
pushd ./locksmith
zip ../builds/locksmith.zip -r * .[^.]* --exclude=*node_modules*
popd