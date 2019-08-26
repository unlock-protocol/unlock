import { Table, Model, Column, DataType } from 'sequelize-typescript'
@Table({ tableName: 'KeyMetadata', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class KeyMetadata extends Model<KeyMetadata> {
  @Column(DataType.JSON)
  data!: JSON

  @Column({ primaryKey: true })
  id!: string

  @Column
  address!: string
}
