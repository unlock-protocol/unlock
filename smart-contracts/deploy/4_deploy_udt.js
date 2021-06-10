module.exports = async ({
    getNamedAccounts,
    deployments
}) => {
    const { unlockOwner, minter, proxyAdmin } = await getNamedAccounts();
    const { deploy, execute } = deployments;

    const udt = await deploy('UnlockDiscountToken', {
        from: unlockOwner,
        log: true,
        args: minter,
        proxy: {
            owner: proxyAdmin,
            // AdminUpgradeabilityProxy was renamed to TransparentUpgradeableProxy 
            // see https://github.com/OpenZeppelin/openzeppelin-contracts/blob/e3661abe84596c8343962fdb35ce612d4bd96480/CHANGELOG.md
            proxyContract: 'OpenZeppelinTransparentProxy',
        }
    });

    console.log(`UDT initialized at: ${udt.address}`)
}

module.exports.tags = ['UDT'];