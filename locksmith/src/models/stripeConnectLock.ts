import { Table, Column, Model } from 'sequelize-typescript'

@Table({ tableName: 'StripeConnectLocks', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class StripeConnectLock extends Model<StripeConnectLock> {
  @Column
  lock!: string

  @Column
  manager!: string

  @Column
  stripeAccount!: string
}
