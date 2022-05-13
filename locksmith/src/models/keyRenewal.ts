import { Table, Model, Column } from 'sequelize-typescript'

@Table({ tableName: 'KeyRenewals', timestamps: true })
export class KeyRenewal extends Model<KeyRenewal> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number

  @Column
  lockAddress!: string

  @Column
  keyId!: string

  @Column
  initiatedBy!: string

  @Column
  tx!: string

  @Column
  network!: number
}
