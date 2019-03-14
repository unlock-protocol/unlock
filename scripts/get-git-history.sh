#!/usr/bin/env bash

# This script gets the git history as by default CircleCI will only get the most recent commit.
git config --replace-all remote.origin.fetch +refs/heads/*:refs/remotes/origin/*
git fetch >> /dev/null
git checkout `git rev-list -1 --before={4.days.ago} master`