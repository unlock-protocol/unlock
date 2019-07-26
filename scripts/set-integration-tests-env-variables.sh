#!/usr/bin/env bash

# Here we set environment variables which will be used when running docker compose
# We are setting them globally so that they are used by the whole "cluster"
# NOTE: Remember to add references in docker-compose-ci.yml when you add a new one
echo export CI=true
echo export UNLOCK_ENV='test'
echo export DB_USERNAME='locksmith_test'
echo export DB_PASSWORD='password'
echo export DB_NAME='locksmith_test'
echo export DB_HOSTNAME='db'
echo export HTTP_PROVIDER='ganache-integration'
echo export LOCKSMITH_URI='http://locksmith:8080'
echo export PAYWALL_URL='http://paywall:3001'
# Capturing context,as this iframe is to be displayed for users of managed account we have updated
# the URL here to reference our instance of Unlock App where the Unlock Provider is configured
echo export USER_IFRAME_URL='http://unlock-provider-unlock-app:9000/account'
echo export PAYWALL_SCRIPT_URL='http://paywall:3001/static/paywall.min.js'
echo export UNLOCK_HOST='unlock-app'
echo export LOCKSMITH_HOST='locksmith'
echo export UNLOCK_PORT='3000'
echo export PAYWALL_PORT='3001'
echo export LOCKSMITH_PORT='8080'
echo export DASHBOARD_URL='http://unlock-app:3000'
echo export READ_ONLY_PROVIDER='http://ganache-integration:8545'
echo export UNLOCK_STATIC_URL='http://unlock-protocol-com:3002'
echo export STRIPE_KEY='pk_test_BHXKmScocCfrQ1oW8HTmnVrB'
echo export ERC20_CONTRACT_ADDRESS='0x591AD9066603f5499d12fF4bC207e2f577448c46'
echo export LOCKSMITH_PURCHASER_ADDRESS='0xe29ec42f0b620b1c9a716f79a02e9dc5a5f5f98a'
echo export WEB3_PROVIDER_HOST='http://ganache-integration:8545'
echo export UNLOCK_CONTRACT_ADDRESS='0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93'
echo export PURCHASER_CREDENTIALS='0x08491b7e20566b728ce21a07c88b12ed8b785b3826df93a7baceb21ddacf8b61'
echo export ETHEREUM_ADDRESS='0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2'
echo export HTTP_PROVIDER_HOST='ganache-integration'
echo export HTTP_PROVIDER_PORT='8545'
echo export BLOCKTIME='1'