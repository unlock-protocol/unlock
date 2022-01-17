import { Table, Column, Model } from 'sequelize-typescript'

@Table({ tableName: 'HookNotifiers', timestamps: true })
export class HookNotifier extends Model<HookNotifier> {
  @Column({ primaryKey: true, autoIncrement: false })
  network!: number

  @Column
  lastSentKeyIds: string[] = []

  @Column
  lastSentLockIds: string[] = []

  @Column
  keyIds: string[] = []

  @Column
  lockIds: string[] = []
}
