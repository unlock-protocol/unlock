import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({ tableName: 'HookNotifiers', timestamps: true })
export class HookNotifier extends Model<HookNotifier> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number

  @Column
  network!: number

  @Column(DataType.ARRAY(DataType.STRING))
  sentKeyIds: string[] = []

  @Column(DataType.ARRAY(DataType.STRING))
  sentLockIds: string[] = []
}
