#!/usr/bin/env bash

# these are the environment variables needed to
# run the integration tests
export DB_USERNAME='locksmith_test'
export DB_PASSWORD='password'
export DB_NAME='locksmith_test'
export DB_HOSTNAME='db'
export CI=true
export HTTP_PROVIDER='ganache-integration'
export LOCKSMITH_URI='http://locksmith:8080'
export PAYWALL_URL=http://unlock:3000/paywall
export PAYWALL_SCRIPT_URL=http://unlock:3000/static/paywall.min.js
