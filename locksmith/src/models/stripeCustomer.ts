import { Table, Column, Model } from 'sequelize-typescript'

interface StripeCustomerAttributes {
  publicKey: string
  StripeCustomerId: string
  stripeConnectedAccountId?: string
}

@Table({ tableName: 'StripeCustomers', timestamps: true })
export class StripeCustomer extends Model<StripeCustomerAttributes> {
  @Column
  publicKey!: string

  @Column
  StripeCustomerId!: string

  @Column
  stripeConnectedAccountId!: string
}
