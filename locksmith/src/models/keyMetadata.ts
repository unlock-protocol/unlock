import Model, { Table, Column, DataType } from './sequelize'

@Table({ tableName: 'KeyMetadata', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class KeyMetadata extends Model<KeyMetadata> {
  @Column(DataType.JSON)
  data!: JSON

  @Column({ primaryKey: true })
  id!: string

  @Column
  address!: string

  @Column
  chain!: number
}
