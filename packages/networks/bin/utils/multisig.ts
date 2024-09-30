import { ethers } from 'ethers'
const multisigABI = require('@unlock-protocol/hardhat-helpers/dist/ABIs/multisig2.json')

const prodSigners = [
  '0x9d3ea9e9adde71141f4534dB3b9B80dF3D03Ee5f', // cc
  '0x4Ce2DD8373ECe0d7baAA16E559A5817CC875b16a', // jg
  '0x4011d09a86D0acA8377a4A8baD691F1ACeeCd672', // nf
  '0xcFd35259E3A468E7bDF84a95bCddAc0B614A9212', // aa
  '0xccb5D94FbfBFDc4953Ca8a114f88773C2fF98e80', // sm
  '0x246A13358Fb27523642D86367a51C2aEB137Ac6C', // cr
  '0x2785f2a3DDaCfDE5947F1A9D6c878CCD7F885400', // cn
  '0x7A23608a8eBe71868013BDA0d900351A83bb4Dc2', // nm
  '0x8de33D8204929ceb2F7AA6299d0643a7f6664c9b', // bw
].sort()

const testnetSigners = [
  '0x4Ce2DD8373ECe0d7baAA16E559A5817CC875b16a', // jg
  '0x246A13358Fb27523642D86367a51C2aEB137Ac6C', // cr
  '0x9d3ea9e9adde71141f4534dB3b9B80dF3D03Ee5f', // cc
].sort()

export const checkMultisig = async ({
  safeAddress,
  providerURL,
  isTestNetwork = false,
}: {
  safeAddress: string
  providerURL: string
  isTestNetwork: boolean
}) => {
  const errors: string[] = []

  const expectedSigners = !isTestNetwork ? prodSigners : testnetSigners
  const expectedPolicy = !isTestNetwork ? 4 : 2
  const provider = new ethers.JsonRpcProvider(providerURL)

  const safe = new ethers.Contract(safeAddress, multisigABI, provider)
  const owners = await safe.getOwners()
  const policy = await safe.getThreshold()

  if (policy < expectedPolicy) {
    errors.push(
      `❌ Unexpected policy: ${policy}/${owners.length} for ${expectedPolicy}/${expectedSigners.length} expected`
    )
  }

  const extraSigners = owners.filter((x) => !expectedSigners.includes(x))
  if (extraSigners.length > 0) {
    errors.push(`❌ Extra signers: ${[...extraSigners].sort()}`)
  }

  const missingSigners = expectedSigners.filter((x) => !owners.includes(x))
  if (missingSigners.length > 0) {
    errors.push(`❌ Missing signers: ${missingSigners}`)
  }

  return errors
}
