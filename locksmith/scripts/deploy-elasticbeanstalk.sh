#!/usr/bin/env bash

# This script deploys the current state of Locksmith
# to the Elasticbeanstalk environment as detailed in the configuration
# outlined at the top of the script.
#
# The heavy lifting is provided via the awscli

BUILD_ID=$1
BRANCH=$2
IS_FORKED_PR=$3
COMMIT_MESSAGE=$4

readonly BUILD="locksmith-${BUILD_ID}"
readonly ARTIFACT_LOCATION="./builds/${BUILD}.zip"
readonly S3_BUCKET="unlock-locksmith"
readonly AWS_REGION="us-east-1"
readonly APPLICATION="locksmith"
readonly DEPLOYMENT_ENVIRONMENT="Locksmith-env-1"

function package_application()
{
    local application=${1}
    local artifact_location=${2}
    
    mkdir builds
    pushd ./${application}
    npm install
    npm run build
    npm run dist ../${artifact_location} 
    popd
    return 0
}

function upload_to_s3()
{
    local artifact_location=${1}
    local s3_bucket=${2}

    aws s3 cp ${artifact_location} s3://${s3_bucket}/
}

function elasticbeanstalk_create_application_version()
{
    local s3_bucket=${1}
    local artifact=${2}
    local description="$COMMIT_MESSAGE"

    aws elasticbeanstalk create-application-version \
    --application-name ${APPLICATION} \
    --version-label ${BUILD} \
    --description "${description:0:199}" \
    --source-bundle S3Bucket="${s3_bucket}",S3Key="${artifact}" \
    --auto-create-application \
    --region ${AWS_REGION}
}

function update_environment()
{
    local environment=${1}
    local version_label=${2}

    aws elasticbeanstalk update-environment \
    --environment-name ${environment} \
    --version-label ${version_label} \
    --region ${AWS_REGION}
}

function check_preconditions()
{
    if [ -n "$AWS_ACCESS_KEY_ID" ] && \
       [ -n "$AWS_SECRET_ACCESS_KEY" ] && \
       [ "$BRANCH" = "master" ]; then
        pip install --user awscli;
        export PATH=$PATH:$HOME/.local/bin;

        return 0
    else
        echo "Unable to deploy due to missing configuration."
        exit 1
    fi
}

function check_is_forked_pr()
{
    if [ "$IS_FORKED_PR" = "true" ]; then
        echo "Skipping deployment because this is a pull request from a forked repository."
        exit 0
    fi
}

check_preconditions
package_application ${APPLICATION} ${ARTIFACT_LOCATION}
upload_to_s3 ${ARTIFACT_LOCATION} ${S3_BUCKET}
elasticbeanstalk_create_application_version ${S3_BUCKET} ${BUILD}.zip

if ! update_environment Locksmith-env-1 ${BUILD} ;
then echo "Unable to update environment, not ready at this time.";
fi

