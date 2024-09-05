import * as ts from 'typescript'
import tsconfig from '../../tsconfig.json'

// validate ts types
export const validateTypes = async (filePath) => {
  let errors: string[] = []
  const program = ts.createProgram([filePath], tsconfig.compilerOptions)
  const diagnostics = ts.getPreEmitDiagnostics(program)
  for (const diagnostic of diagnostics) {
    if (diagnostic.file?.fileName === filePath) {
      const message = diagnostic.messageText
      errors = [
        ...errors,
        `❌ Syntax Error: (${diagnostic.file?.fileName}) ${message}`,
      ]
    }
  }
  return errors
}
