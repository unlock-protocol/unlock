import { readdir, writeFile, mkdir } from 'node:fs/promises'
import { getIconName } from '../lib/utils'

const main = async () => {
  const dirPath = 'lib/icons'
  const files = await readdir(dirPath, { withFileTypes: true })
  const importStatements: string[] = []
  const exportStatement: string[] = []

  for (const file of files) {
    if (file.isFile() && file.name.endsWith('.svg')) {
      try {
        let name = getIconName(file.name.replace('.svg', ''))
        importStatements.push(
          `import ${name} from '~/icons/${file.name}?react'`
        )
        exportStatement.push(name)
      } catch (error) {
        console.error(`Error processing icon ${file.name}:`, error)
      }
    }
  }

  // Add type safety for React 19
  const output = `${importStatements.join('\n')}

// Type-safe Icons object for React 19
export const Icons = {
${exportStatement.join(',\n')}
} as const;
`
  await mkdir('lib/@generated', { recursive: true })
  await writeFile('lib/@generated/icons.ts', output, {})
  console.log(`Successfully generated ${exportStatement.length} icons`)
}

main().catch((error) => {
  console.error('Failed to build icons:', error)
  process.exit(1)
})
