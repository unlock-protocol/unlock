import { Table, Model, Column } from 'sequelize-typescript'

@Table({ tableName: 'Transactions', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class Transaction extends Model<Transaction> {
  @Column
  transactionHash!: string

  @Column
  sender!: string

  @Column
  recipient!: string
}
