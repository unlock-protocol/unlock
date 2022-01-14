import { Table, Column, Model, AllowNull, DataType } from 'sequelize-typescript'

@Table({ tableName: 'HookEvents', timestamps: true })
export class HookEvent extends Model<HookEvent> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number

  @Column
  network!: string

  @Column
  lock?: string

  @AllowNull(true)
  @Column
  key?: string

  @Column
  hookId!: number

  @Column({ type: DataType.JSON })
  body!: any

  @Column
  state!: string

  @Column
  lastError?: string

  @Column
  attempts!: number
}
