import { Table, Column, Model } from 'sequelize-typescript'

@Table({ tableName: 'AuthorizedLocks', timestamps: true })
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
