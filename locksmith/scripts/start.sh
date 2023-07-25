#!/bin/bash

# Check if the environment argument is provided, otherwise use NODE_ENV as a fallback
if [ $# -eq 0 ]; then
    if [ -z "$NODE_ENV" ]; then
        echo "No environment specified. Set NODE_ENV or provide 'prod' or 'staging' as an argument."
        exit 1
    fi
    environment="$NODE_ENV"
else
    environment="$1"
fi

# Check if the provided environment is valid
if [ "$environment" != "prod" ] && [ "$environment" != "staging" ]; then
    echo "Invalid environment. Available options are 'prod' or 'staging'."
    exit 1
fi

# Define the environment file path based on the provided argument
env_file="./.op.env.$environment"

# Check if the environment file exists
if [ ! -f "$env_file" ]; then
    echo "Environment file $env_file not found."
    exit 1
fi

# Run the command with the appropriate environment file
command="op run --env-file=\"$env_file\" -- yarn tsx ./src/server.ts"
echo "Running command: $command"
eval "$command"
