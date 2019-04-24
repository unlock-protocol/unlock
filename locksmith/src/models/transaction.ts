import { Table, Model, Column } from 'sequelize-typescript'

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
}
