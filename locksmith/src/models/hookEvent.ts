import Model, { Table, Column, AllowNull, DataType } from './sequelize'

@Table({ tableName: 'HookEvents', timestamps: true })
export class HookEvent extends Model<HookEvent> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number

  @Column
  network!: number

  @Column
  lock?: string

  @AllowNull(true)
  @Column
  key?: string

  @Column
  hookId!: number

  @Column
  topic!: string

  @Column({ type: DataType.JSON })
  body!: any

  @Column
  state!: string

  @Column
  lastError?: string

  @Column
  attempts!: number
}
