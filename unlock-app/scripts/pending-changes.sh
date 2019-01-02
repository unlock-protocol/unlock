#!/usr/bin/env bash

# Cancel changes in artifacts (remove once artifacts are not in git anymore, which will happen
# once we deploy from travis, rather than from git)
git checkout ../smart-contracts/build/contracts/*.json
if [[ -n $(git status -s) ]]
then
  >&2 echo "FAILURE: Some files were re-written after commit. Please make sure you run npm run reformat to make sure the following files are using the right formatting:"
  git diff
  exit 1 
else 
  exit 0
fi

