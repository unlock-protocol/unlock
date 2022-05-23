import { Table, Model, DataType, Column } from 'sequelize-typescript'

@Table({ tableName: 'Transactions', timestamps: true })
export class Transaction extends Model<Transaction> {
  @Column
  public transactionHash!: string

  @Column
  public sender!: string

  @Column
  public recipient!: string

  @Column
  public chain!: number

  @Column
  public for!: string

  @Column(DataType.TEXT)
  public data!: string
}
