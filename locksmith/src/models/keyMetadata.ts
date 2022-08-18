import { Table, Model, Column, DataType } from 'sequelize-typescript'

@Table({ tableName: 'KeyMetadata', timestamps: true })
export class KeyMetadata extends Model<KeyMetadata> {
  @Column(DataType.JSONB)
  data!: JSON

  @Column({ primaryKey: true })
  id!: string

  @Column
  address!: string

  @Column
  chain!: number
}
