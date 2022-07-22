import { Table, Model, Column, DataType } from 'sequelize-typescript'

interface LockMetadataAttributes {
  data: any
  address: string
  chain: number
}

@Table({ tableName: 'LockMetadata', timestamps: true })
export class LockMetadata extends Model<LockMetadataAttributes> {
  @Column(DataType.JSON)
  data!: any

  @Column({ primaryKey: true })
  address!: string

  @Column
  chain!: number
}
