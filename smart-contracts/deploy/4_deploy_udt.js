module.exports = async ({
    getNamedAccounts,
    deployments
}) => {
    const { minter, proxyAdmin } = await getNamedAccounts();
    const { deploy, execute } = deployments;


    // Register Unlock in the zos.json
    await deploy('UnlockDiscountToken', {
        from: proxyAdmin,
        log: true
    });

    await execute(
        'UnlockDiscountToken',
        {
            from: proxyAdmin,
            log: true
        },
        'initialize', // methodName
        minter // args
    );
}