import { Table, Column, Model } from 'sequelize-typescript'

interface AuthorizedLockAttributes {
  address: string
  authorizedAt: Date
  stripe_account_id: string
  chain: number
}

@Table({ tableName: 'AuthorizedLocks', timestamps: true })
export class AuthorizedLock extends Model<AuthorizedLockAttributes> {
  @Column
  address!: string

  @Column
  authorizedAt!: Date

  @Column
  stripe_account_id!: string

  @Column
  chain!: number
}
