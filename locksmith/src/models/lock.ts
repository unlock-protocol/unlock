import { Table, Model, Column } from 'sequelize-typescript'

interface LockAttributes {
  name: string
  address: string
  owner: string
  chain: number
}

@Table({ tableName: 'Locks', timestamps: true })
export class Lock extends Model<LockAttributes> {
  @Column
  name!: string

  @Column({ primaryKey: true })
  address!: string

  @Column
  owner!: string

  @Column
  chain!: number
}
