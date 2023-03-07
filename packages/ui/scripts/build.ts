import { readdir, writeFile } from 'node:fs/promises'
import { getIconName } from '../lib/utils'

const main = async () => {
  const dirPath = 'lib/icons'
  const files = await readdir(dirPath, { withFileTypes: true })
  const importStatements: string[] = []
  const exportStatement: string[] = []
  for (const file of files) {
    if (file.isFile()) {
      let name = getIconName(file.name.replace('.svg', ''))
      importStatements.push(`import ${name} from './icons/${file.name}'`)
      exportStatement.push(name)
    }
  }
  const output = `${importStatements.join('\n')}


export const SvgIcon = {
${exportStatement.join(',\n')}
}
`
  await writeFile('lib/icons.tsx', output)
}

main().catch(console.error)
