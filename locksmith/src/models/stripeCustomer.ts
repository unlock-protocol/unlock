import Model, { Table, Column } from './sequelize'

@Table({ tableName: 'StripeCustomers', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class StripeCustomer extends Model<StripeCustomer> {
  @Column
  publicKey!: string

  @Column
  StripeCustomerId!: string

  @Column
  stripeConnectedAccountId!: string
}
