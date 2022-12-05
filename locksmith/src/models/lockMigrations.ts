import { Table, Model, Column, DataType } from 'sequelize-typescript'

interface LockMigrationsAttributes {
  lockAddress: string
  newLockAddress: string
  initiatedBy: string
  logs: string
  migrated: boolean
  chain: number
  newChain: number
}

@Table({ tableName: 'LockMigrations', timestamps: true })
export class LockMigrations extends Model<LockMigrationsAttributes> {
  @Column
  lockAddress!: string

  @Column
  newLockAddress!: string

  @Column
  initiatedBy!: string

  @Column(DataType.TEXT)
  logs!: string

  @Column
  migrated!: boolean

  @Column
  chain!: number

  @Column
  newChain!: number
}
