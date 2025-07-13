#!/bin/bash

read -r -d '' FILE << EOM
{
  "SMTP_PORT": "$SMTP_PORT",
  "SMTP_HOST": "$SMTP_HOST",
  "SMTP_USERNAME": "$SMTP_USERNAME",
  "SMTP_PASSWORD": "$SMTP_PASSWORD"
} 
EOM

echo $FILE | yarn wrangler secret:bulk
