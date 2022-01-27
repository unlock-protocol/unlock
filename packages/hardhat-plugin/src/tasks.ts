import { ActionType } from 'hardhat/types'

interface CreateLockArgs {
  name: string
}

export const deployLockTask: ActionType<CreateLockArgs> = async (
  { name },
  { network }
) => {
  // if (!ethers) throw Error('hardhat-ethers is required to run this task.')
  console.log(network)
  console.log(name)
}

export default deployLockTask
