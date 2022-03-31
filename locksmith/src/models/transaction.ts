import Model, { Table, Column, DataType } from './sequelize'

@Table({ tableName: 'Transactions', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
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
