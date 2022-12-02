import { Table, Column, Model } from 'sequelize-typescript'

interface StripeCustomerAttributes {
  publicKey: string
  StripeCustomerId: string
  stripeConnectedAccountId?: string
}

@Table({ tableName: 'StripeCustomers', timestamps: true })
export class StripeCustomer extends Model<StripeCustomerAttributes> {
  @Column({
    unique: 'stripe_customers_pkey',
  })
  publicKey!: string

  @Column
  StripeCustomerId!: string

  @Column({
    unique: 'stripe_customers_pkey',
  })
  stripeConnectedAccountId!: string
}
