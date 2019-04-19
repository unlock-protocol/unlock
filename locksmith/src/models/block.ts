import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({ tableName: 'Blocks', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class Block extends Model<Block> {
  @Column(DataType.INTEGER)
  timestamp!: number

  @Column
  hash!: string

  @Column(DataType.BIGINT)
  number!: number

  @Column
  chain!: number
}
