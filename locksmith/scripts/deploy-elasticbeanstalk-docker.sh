application=$1
environment=$2
db_username=$3
db_password=$4
db_name=$5
db_hostname=$6
node_env=$7
is_forked_pr=$8
build_id=$9
message="${10}"
stripe_secret=${11}
purchaser_credentials=${12}
web3_provider_host=${13}
unlock_contract_address=${14}
graphql_base_url=${15}
metadata_host=${16}


function check_is_forked_pr()
{
    if [ is_forked_pr = "true" ]; then
        echo "Skipping deployment because this is a pull request from a forked repository."
        exit 0
    fi
}

function check_if_locksmith_changed()
{
    # latest commit
    LATEST_COMMIT=$(git rev-parse HEAD)
    # latest commit where path/to/folder1 was changed
    LAST_LOCKSMITH_COMMIT=$(git log -1 --format=format:%H --full-diff ./locksmith)
    
    if [ $LAST_LOCKSMITH_COMMIT != $LATEST_COMMIT ];then
        echo "No changes to Locksmith, no need to deploy"
        exit 0
    fi
}

function deploy()
{
    environment_name=$1

    if eb status ${environment_name}; then
        eb setenv DB_USERNAME=${db_username} DB_PASSWORD=${db_password} DB_NAME=${db_name} DB_HOSTNAME=${db_hostname} NODE_ENV=${node_env} STRIPE_SECRET=${stripe_secret} PURCHASER_CREDENTIALS=${purchaser_credentials} WEB3_PROVIDER_HOST=${web3_provider_host} UNLOCK_CONTRACT_ADDRESS=${unlock_contract_address} GRAPHQL_BASE_URL=${graphql_base_url} METADATA_HOST=${metadata_host}
        eb deploy ${environment_name} --label locksmith-${build_id} --message "${message:0:199}" --timeout 10
    else
        eb create ${environment_name} --envvars DB_USERNAME=${db_username},DB_PASSWORD=${db_password},DB_NAME=${db_name},DB_HOSTNAME=${db_hostname},NODE_ENV=${node_env},STRIPE_SECRET=${stripe_secret},PURCHASER_CREDENTIALS=${purchaser_credentials},WEB3_PROVIDER_HOST=${web3_provider_host},UNLOCK_CONTRACT_ADDRESS=${unlock_contract_address},GRAPHQL_BASE_URL=${graphql_base_url},METADATA_HOST=${metadata_host} --elb-type classic
    fi
    
}

check_is_forked_pr
check_if_locksmith_changed

cd locksmith

eb init ${application} -p docker --region us-east-1

deploy ${environment} 