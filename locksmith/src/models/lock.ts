import { Table, Model, Column } from 'sequelize-typescript'

@Table({ tableName: 'Locks', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class Lock extends Model<Lock> {
  @Column
  name!: string

  @Column({ primaryKey: true })
  address!: string

  @Column
  owner!: string

  @Column
  chain!: number
}
