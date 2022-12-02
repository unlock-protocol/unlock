import { Table, Column, Model, AllowNull, Validate } from 'sequelize-typescript'

interface HookAttributes {
  id: number
  network: number
  topic: string
  lock?: string
  expiration: Date
  mode: 'subscribe' | 'unsubscribe'
  callback: string
  secret?: string
}

@Table({ tableName: 'Hooks', timestamps: true })
export class Hook extends Model<HookAttributes> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number

  @Column
  network!: number

  @Column
  topic!: string

  @AllowNull(true)
  @Column
  lock?: string

  @Column
  expiration!: Date

  @Validate({
    isIn: [['subscribe', 'unsubscribe']],
  })
  @Column
  mode!: 'subscribe' | 'unsubscribe'

  @Column
  callback!: string

  @AllowNull(true)
  @Column
  secret?: string
}
