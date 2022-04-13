import { Table, Column, Model } from 'sequelize-typescript'

@Table({ tableName: 'PaymentIntents', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class PaymentIntent extends Model<PaymentIntent> {
  @Column
  lockAddress!: string

  @Column
  chain!: number

  @Column
  userAddress!: string

  @Column
  stripeCustomerId!: string // Overall customer id

  @Column
  intentId!: string

  @Column
  connectedStripeId!: string // Account connected to the lock

  @Column
  connectedCustomerId!: string // connected account specific customer id
}
