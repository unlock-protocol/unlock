import React from 'react'
import { ethers } from 'ethers'
import withConfig from '../../utils/withConfig'

interface RefundButtonProps {
  accountAddress: string
  lockAddress: string
  config: {
    providers: any
    externalRefundContractAddress: string
    env: 'dev' | 'test' | 'staging' | 'prod'
  }
}
interface RefundButtonState {
  refundInitiated: boolean
}

const lockAddressesByEnv = {
  dev: '0x0AAF2059Cb2cE8Eeb1a0C60f4e0f2789214350a5',
  test: '0x0AAF2059Cb2cE8Eeb1a0C60f4e0f2789214350a5',
  staging: '0x3628D7170209c58DC1e8F51AD190b69d044FbBF2',
  prod: '0xB0ad425cA5792DD4C4Af9177c636e5b0e6c317BF',
}

export class RefundButton extends React.Component<
  RefundButtonProps,
  RefundButtonState
> {
  private contract: ethers.Contract
  constructor(props: RefundButtonProps) {
    super(props)
    const { config } = props
    const provider = config.providers[Object.keys(config.providers)[0]]
    const web3Provider = new ethers.providers.Web3Provider(provider)
    const signer = web3Provider.getSigner()
    const abi = ['function refund(address recipient)']
    this.contract = new ethers.Contract(
      config.externalRefundContractAddress,
      abi,
      signer
    )

    this.state = {
      refundInitiated: false,
    }
  }

  initiateRefund = async () => {
    const { accountAddress } = this.props
    this.setState({
      refundInitiated: true,
    })
    // We override the gas price and gas limit here because web3
    // wallets would error when they automatically calculated the values.
    await this.contract.refund(accountAddress, {
      gasPrice: 20000000000,
      gasLimit: 600000,
    })
  }

  render() {
    const { refundInitiated } = this.state
    const {
      lockAddress,
      config: { env },
    } = this.props

    // Only show the refund button for EthWaterloo
    if (lockAddress.toLowerCase() !== lockAddressesByEnv[env].toLowerCase()) {
      return null
    }

    if (refundInitiated) {
      return (
        <button type="button" disabled>
          Refund Initiated
        </button>
      )
    }

    return (
      <button type="button" onClick={this.initiateRefund}>
        Perform refund
      </button>
    )
  }
}

export default withConfig(RefundButton)
