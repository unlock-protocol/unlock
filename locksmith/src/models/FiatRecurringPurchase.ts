import { Table, Model, Column } from 'sequelize-typescript'

@Table({ tableName: 'FiatRecurringPurchase', timestamps: true })
export class FiatRecurringPurchase extends Model<FiatRecurringPurchase> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number

  @Column
  lockAddress!: string

  @Column
  keyId!: string

  @Column
  userAddress!: string

  @Column
  recurring!: number

  @Column
  transacted = 0

  @Column
  amount!: number

  @Column
  customerId!: string

  @Column
  network!: number
}
