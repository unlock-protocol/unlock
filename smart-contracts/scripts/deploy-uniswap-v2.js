const { ethers } = require('hardhat');
const UniswapV2Factory = require('@uniswap/v2-core/build/UniswapV2Factory.json');
const UniswapV2Router02 = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');

const WETH = {
    mainnet: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    ropsten: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    rinkeby: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
    goerli: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    kovan: "0xd0A1E359811322d97991E03f863a0C30C2cF029C",
}

const log = (...message) => {
    // eslint-disable-next-line no-console
    console.log('UNISWAP/WETH SETUP >', ...message)
}

async function main() {

    const [deployer] = await ethers.getSigners();
    deployerAddress = deployer.address;
    log(`Deploying Uniswap contracts using ${deployerAddress}`);

    //Deploy WETH
    const weth = await ethers.getContractFactory('WETH9');
    const wethInstance = await weth.deploy();
    await wethInstance.deployed();

    log(`WETH deployed to : ${wethInstance.address}`);

    //Deploy Factory
    const factory = await ethers.getContractFactory(UniswapV2Factory.abi, UniswapV2Factory.bytecode);
    const factoryInstance = await factory.deploy(deployerAddress);
    await factoryInstance.deployed();

    log(`Uniswap V2 Factory deployed to : ${factoryInstance.address}`);

    //Deploy Router passing Factory Address and WETH Address
    const router = await ethers.getContractFactory(UniswapV2Router02.abi, UniswapV2Router02.bytecode);
    const routerInstance = await router.deploy(
        factoryInstance.address,
        wethInstance.address
    );
    await routerInstance.deployed();

    log(`Router V02 deployed to :  ${routerInstance.address}`);

    return {
        weth: wethInstance.address,
        factory: factoryInstance.address,
        router: routerInstance.address
    }
}   

// execute as standalone
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error)
            process.exit(1)
        })
}

module.exports = main