import { Table, Column, Model, DataType } from 'sequelize-typescript'

interface ChargeAttributes {
  lock: string
  chain: number
  userAddress: string
  recipients: string[]
  stripeCharge: string
  stripeCustomerId?: string
  connectedCustomer?: string
  totalPriceInCents: number
  unlockServiceFee: number | null
  transactionHash?: string
}

@Table({ tableName: 'Charges', timestamps: true })
export class Charge extends Model<ChargeAttributes> {
  @Column
  lock!: string

  @Column
  chain!: number

  @Column
  userAddress!: string

  @Column(DataType.JSON)
  recipients?: string[]

  @Column
  stripeCharge!: string

  @Column
  stripeCustomerId!: string

  @Column
  connectedCustomer!: string

  @Column
  totalPriceInCents!: number

  @Column
  unlockServiceFee!: number

  @Column
  transactionHash!: string
}
