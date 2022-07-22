import { Optional } from 'sequelize'
import { Table, Column, Model, DataType } from 'sequelize-typescript'

interface PaymentIntentAttributes {
  lockAddress: string
  chain: number
  userAddress: string
  stripeCustomerId: string // Overall customer id
  recipients?: string[]
  intentId: string
  connectedStripeId: string // Account connected to the lock
  connectedCustomerId: string // connected account specific customer id
  createdAt: Date
  updatedAt: Date
}

type PaymentIntentCreationAttributes = Optional<
  PaymentIntentAttributes,
  'createdAt' | 'updatedAt'
>

@Table({ tableName: 'PaymentIntents', timestamps: true })
export class PaymentIntent extends Model<
  PaymentIntentAttributes,
  PaymentIntentCreationAttributes
> {
  @Column
  lockAddress!: string

  @Column
  chain!: number

  @Column
  userAddress!: string

  @Column
  stripeCustomerId!: string // Overall customer id

  @Column(DataType.JSON)
  recipients?: string[]

  @Column
  intentId!: string

  @Column
  connectedStripeId!: string // Account connected to the lock

  @Column
  connectedCustomerId!: string // connected account specific customer id
}
