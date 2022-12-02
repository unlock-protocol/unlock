import { Table, Column, Model, AllowNull, DataType } from 'sequelize-typescript'

interface HookEventAttributes {
  id: number
  network: number
  lock?: string
  key?: string
  hookId: number
  topic: string
  body: any
  state: string
  lastError?: string
  attempts: number
  createdAt?: Date
  updatedAt?: Date
}

@Table({ tableName: 'HookEvents', timestamps: true })
export class HookEvent extends Model<HookEventAttributes> {
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
