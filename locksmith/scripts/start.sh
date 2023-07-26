#!/bin/bash

# Check if the argument is provided
if [ $# -eq 0 ]; then
    echo "No argument provided. Please specify 'worker' or 'server'."
    exit 1
fi

# Check if the argument is 'worker' or 'server'
if [ "$1" != "worker" ] && [ "$1" != "server" ]; then
    echo "Invalid argument. Available options are 'worker' or 'server'."
    exit 1
fi

# Set the environment based on NODE_ENV or fallback to 'prod'
if [ -z "$NODE_ENV" ]; then
    environment="prod"
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

# Prepare the command based on the argument
if [ "$1" == "worker" ]; then
    command="op run --env-file=\"$env_file\" -- yarn tsx ./src/worker/server.ts"
else
    command="op run --env-file=\"$env_file\" -- yarn tsx ./src/server.ts"
fi

echo "Running command: $command"
eval "$command"
