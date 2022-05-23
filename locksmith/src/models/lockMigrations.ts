import { Table, Model, Column, DataType } from 'sequelize-typescript'

@Table({ tableName: 'LockMigrations', timestamps: true })
export class LockMigrations extends Model<LockMigrations> {
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
