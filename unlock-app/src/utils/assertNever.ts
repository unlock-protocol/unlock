// Util function that will cause TS to show an error at compile time
// if a branch can be reached that contains this. Useful for exhaustiveness checking.

export function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`)
}
