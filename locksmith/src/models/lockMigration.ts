import { Table, Model, Column } from 'sequelize-typescript'

@Table({ tableName: 'LockMigrations', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class LockMigration extends Model<LockMigration> {
  @Column({ primaryKey: true })
  lockAddress!: string

  @Column
  newLockAddress!: string

  @Column
  initiatedBy!: string

  @Column
  logs!: string

  @Column
  chain!: number
}
