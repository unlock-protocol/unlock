import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({ tableName: 'Charges', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class Charge extends Model<Charge> {
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
