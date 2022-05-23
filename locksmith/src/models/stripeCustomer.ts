import { Table, Column, Model } from 'sequelize-typescript'

@Table({ tableName: 'StripeCustomers', timestamps: true })
export class StripeCustomer extends Model<StripeCustomer> {
  @Column
  publicKey!: string

  @Column
  StripeCustomerId!: string

  @Column
  stripeConnectedAccountId!: string
}
