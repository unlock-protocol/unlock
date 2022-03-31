import Model, { Table, Column } from './sequelize'

@Table({ tableName: 'AuthorizedLocks', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class AuthorizedLock extends Model<AuthorizedLock> {
  @Column
  address!: string

  @Column
  authorizedAt!: Date

  @Column
  stripe_account_id!: string

  @Column
  chain!: number
}
