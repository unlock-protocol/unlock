import { Table, Model, Column, DataType } from 'sequelize-typescript'
@Table({ tableName: 'LockMetadata', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class LockMetadata extends Model<LockMetadata> {
  @Column(DataType.JSON)
  data!: JSON

  @Column({ primaryKey: true })
  address!: string
}
