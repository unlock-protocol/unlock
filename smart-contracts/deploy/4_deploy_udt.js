module.exports = async ({
    getNamedAccounts,
    deployments
}) => {
    const { minter, proxyAdmin } = await getNamedAccounts();
    const { deploy, execute } = deployments;


    // Register Unlock in the zos.json
    const udt = await deploy('UnlockDiscountToken', {
        from: proxyAdmin,
        log: true,
        proxy: {
            owner: proxyAdmin,
            // AdminUpgradeabilityProxy was renamed to TransparentUpgradeableProxy 
            // see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/e3661abe84596c8343962fdb35ce612d4bd96480/CHANGELOG.md
            proxyContract: 'OpenZeppelinTransparentProxy',
        }
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

module.exports.tags = ['UDT'];