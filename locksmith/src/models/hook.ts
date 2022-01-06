import { Table, Column, Model, AllowNull, Validate } from 'sequelize-typescript'

@Table({ tableName: 'Hooks', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class Hook extends Model<Hook> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number

  @Column
  network!: string

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

  @Validate({
    isUrl: true,
  })
  @Column
  callback!: string

  @AllowNull(true)
  @Column
  secret?: string
}
