#!/usr/bin/env bash

# Here we set environment variables which will be used when running docker compose
# We are setting them globally so that they are used by the whole "cluster"
echo export CI=true
echo export UNLOCK_ENV='test'
echo export DB_USERNAME='locksmith_test'
echo export DB_PASSWORD='password'
echo export DB_NAME='locksmith_test'
echo export DB_HOSTNAME='db'
echo export HTTP_PROVIDER='ganache-integration'
echo export LOCKSMITH_URI='http://locksmith:8080'
echo export PAYWALL_URL='http://paywall-integration:3001'
echo export PAYWALL_SCRIPT_URL='http://paywall-integration:3001/static/paywall.min.js'
echo export UNLOCK_HOST='unlock-app'
echo export LOCKSMITH_HOST='locksmith'
echo export UNLOCK_PORT='3000'
echo export PAYWALL_PORT='3001'
echo export LOCKSMITH_PORT='8080'
echo export DASHBOARD_URL='http://unlock-app:3000'
echo export READ_ONLY_PROVIDER='http://ganache-integration:8545'
echo export UNLOCK_STATIC_URL='http://unlock-protocol-com:3002'
