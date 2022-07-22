import { Table, Column, Model } from 'sequelize-typescript'

interface StripeConnectLockAttributes {
  lock: string
  chain: number
  manager: string
  stripeAccount: string
}

@Table({ tableName: 'StripeConnectLocks', timestamps: true })
export class StripeConnectLock extends Model<StripeConnectLockAttributes> {
  @Column
  lock!: string

  @Column
  chain!: number

  @Column
  manager!: string

  @Column
  stripeAccount!: string
}
