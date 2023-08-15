#!/bin/bash

# Set the environment based on NODE_ENV or fallback to 'production'
if [ -z "$NODE_ENV" ]; then
    environment="production"
else
    environment="$NODE_ENV"
fi

# Define the environment file path based on the provided argument and environment
env_file="./.op.env.$environment"

# Check if the environment file exists
if [ ! -f "$env_file" ]; then
    echo "Environment file $env_file not found."
    exit 1
fi

# First: run the migrations!
command="op run --env-file=\"$env_file\" -- yarn run db:migrate"

echo "Running command: $command"
eval "$command"

# TODO:
# Check that locksmith is up and running
# And fail if not... if this script fails, the whole release fails
