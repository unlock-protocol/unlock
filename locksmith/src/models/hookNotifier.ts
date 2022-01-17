import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({ tableName: 'HookNotifiers', timestamps: true })
export class HookNotifier extends Model<HookNotifier> {
  @Column({ primaryKey: true, autoIncrement: false })
  network!: number

  @Column(DataType.ARRAY(DataType.STRING))
  lastSentKeyIds: string[] = []

  @Column(DataType.ARRAY(DataType.STRING))
  lastSentLockIds: string[] = []

  @Column(DataType.ARRAY(DataType.STRING))
  keyIds: string[] = []

  @Column(DataType.ARRAY(DataType.STRING))
  lockIds: string[] = []
}
