import {
  providers as EthersProviders,
  TypedDataDomain,
  TypedDataField,
  JsonRpcSigner,
  Signer,
} from 'ethers'
import { Address, ProtocolFamily } from '@coinbase/waas-sdk-web'
export declare class WaasEthersSigner extends JsonRpcSigner {
  waasAddress: Address<ProtocolFamily.EVM>
  provider?: EthersProviders.Provider
  constructor(
    address: Address<ProtocolFamily.EVM>,
    provider?: EthersProviders.Provider
  )
  connect(provider?: EthersProviders.Provider): Signer
  getAddress(): Promise<string>
  signTransaction(
    transaction: EthersProviders.TransactionRequest
  ): Promise<string>
  signMessage(message: string | Uint8Array): Promise<string>
  signTypedData(
    domain: TypedDataDomain,
    types: Record<string, Array<TypedDataField>>,
    value: Record<string, any>
  ): Promise<string>
}
