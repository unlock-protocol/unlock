const fs = require('fs-extra');
const path = require('path');

const listFiles = async ( folderName: String ) => {

    const folderPath = path.resolve('src', folderName)

    if (!await fs.pathExists(folderPath)) throw new Error(`path not found: ${folderPath}`)

    try {
        const files = await fs.readdir(folderPath);
        return files
    } catch (err) {
        console.log(err);
    }
}

const parseExports = async (folderName : String) => {
    const files = await listFiles(folderName)
    const exports = files
        .filter((f: String) => f.includes('.json'))
        .map((f: String) => `./${folderName}/${f}`)

    //make sure all paths exists
    exports.forEach(async (f: String) => await fs.pathExists(path.resolve(f)))

    return exports
}

async function main () {
    const folders = [
        'abis/PublicLock',
        'abis/Unlock',
        'abis/UnlockDiscountToken',
    ]
    
    const paths = await Promise.all(
        folders.map(async f => await parseExports(f))
    )

    const exports = paths
        .flat()
        .map(abiPath => {
            const s = abiPath.split('/')
            const contractName = s[2]
            const versionNumber = s[3].replace(contractName, '').replace('.json', '')            
            return {
                contractName,
                versionNumber,
                abiPath
            }
        })

    console.log('// This file is generated, please don\'t edit directly')
    console.log('// Refer to \'utils/parser.ts\' and \'yarn build:index\' for more\n')

    exports.forEach(({
        contractName,
        versionNumber,
        abiPath
    }) => console.log(`import ${contractName}${versionNumber} from '${abiPath}' `))
    
    console.log(`\n\n// exports`)
    
    exports.forEach(({
        contractName,
        versionNumber
    }) => console.log(`export {${contractName}${versionNumber}}`))
    
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })