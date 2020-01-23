application=$1
environment=$2
db_username=$3
db_password=$4
db_name=$5
db_hostname=$6
is_forked_pr=$8
build_id=$9
message="${10}"
web3_provider_host=${13}
graphql_base_url=${15}

function check_is_forked_pr()
{
    if [ is_forked_pr = "true" ]; then
        echo "Skipping deployment because this is a pull request from a forked repository."
        exit 0
    fi
}

function check_if_changed()
{
    LATEST_COMMIT=$(git rev-parse HEAD)
    LAST_PROJECT_COMMIT=$(git log -1 --format=format:%H --full-diff ./nudge)
    
    if [ $LAST_LOCKSMITH_COMMIT != $LATEST_COMMIT ];then
        echo "No changes to project, no need to deploy"
        exit 0
    fi
}

function deploy()
{
    environment_name=$1
    
    if eb status ${environment_name}; then
        eb setenv DB_USERNAME=${db_username} DB_PASSWORD=${db_password} DB_NAME=${db_name} DB_HOSTNAME=${db_hostname} WEB3_PROVIDER_HOST=${web3_provider_host} GRAPHQL_BASE_URL=${graphql_base_url}
        eb deploy ${environment_name} --label nudge-${build_id} --timeout 10
    else
        eb create ${environment_name} --envvars DB_USERNAME=${db_username},DB_PASSWORD=${db_password},DB_NAME=${db_name},DB_HOSTNAME=${db_hostname},WEB3_PROVIDER_HOST=${web3_provider_host},GRAPHQL_BASE_URL=${graphql_base_url} --elb-type classic
    fi
    
}

check_is_forked_pr
check_if_changed

cd nudge

eb init ${application} -p docker --region us-east-1
deploy ${environment}