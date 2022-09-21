import { Table, Column, Model } from 'sequelize-typescript'

@Table({ tableName: 'KeySubscriptions', timestamps: true })
export class KeySubscription extends Model<KeySubscription> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number

  @Column
  keyId!: number

  @Column
  lockAddress!: string

  @Column
  network!: number

  @Column
  userAddress!: string

  @Column
  amount!: number

  @Column
  unlockServiceFee!: number

  @Column
  stripeCustomerId!: string

  @Column
  connectedCustomer!: string

  @Column
  recurring!: number
}
