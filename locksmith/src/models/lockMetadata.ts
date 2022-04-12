import { Table, Model, Column, DataType } from 'sequelize-typescript'

@Table({ tableName: 'LockMetadata', timestamps: true })
export class LockMetadata extends Model<LockMetadata> {
  @Column(DataType.JSON)
  data!: JSON

  @Column({ primaryKey: true })
  address!: string

  @Column
  chain!: number
}
