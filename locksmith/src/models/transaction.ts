import { Table, Model, DataType, Column } from 'sequelize-typescript'

interface TransactionAttributes {
  transactionHash: string
  sender: string
  recipient: string
  chain: number
  for: string | null
  data: string
}

@Table({ tableName: 'Transactions', timestamps: true })
export class Transaction extends Model<TransactionAttributes> {
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
