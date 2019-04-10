application=$1
environment=$2
db_username=$3
db_password=$4
db_name=$5
db_hostname=$6
node_env=$7
is_forked_pr=$8


function check_is_forked_pr()
{
    if [ is_forked_pr = "true" ]; then
        echo "Skipping deployment because this is a pull request from a forked repository."
        exit 0
    fi
}

check_is_forked_pr

cd locksmith

eb init ${application} -p docker --region us-east-1

if eb status ${environment}; then
    eb deploy ${environment}
else
    eb create ${environment} --envvars DB_USERNAME=${db_username},DB_PASSWORD=${db_password},DB_NAME=${db_name},DB_HOSTNAME=${db_hostname},NODE_ENV=${node_env} --elb-type classic
fi