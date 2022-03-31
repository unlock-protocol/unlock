import Model, { Table, Column, DataType } from './sequelize'

@Table({ tableName: 'LockMetadata', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class LockMetadata extends Model<LockMetadata> {
  @Column(DataType.JSON)
  data!: JSON

  @Column({ primaryKey: true })
  address!: string

  @Column
  chain!: number
}
