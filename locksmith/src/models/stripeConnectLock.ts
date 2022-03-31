import Model, { Table, Column } from './sequelize'

@Table({ tableName: 'StripeConnectLocks', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
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
