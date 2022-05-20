import { Table, Column, Model } from 'sequelize-typescript'

@Table({ tableName: 'StripeConnectLocks', timestamps: true })
export class StripeConnectLock extends Model<StripeConnectLock> {
  @Column
  lock!: string

  @Column
  chain!: number

  @Column
  manager!: string

  @Column
  stripeAccount!: string
}
