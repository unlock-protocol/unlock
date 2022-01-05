import { Table, Column, Model, AllowNull } from 'sequelize-typescript'

@Table({ tableName: 'Hooks', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class Hook extends Model<Hook> {
  @Column({ primaryKey: true, autoIncrement: true })
  hookId!: number

  @Column
  network!: string

  @Column
  lock!: string

  @Column
  expiration!: Date

  @Column
  url!: string

  @AllowNull(true)
  @Column
  secret?: string
}
