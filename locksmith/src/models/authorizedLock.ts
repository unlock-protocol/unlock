import { Table, Column, Model } from 'sequelize-typescript'

@Table({ tableName: 'AuthorizedLocks', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class AuthorizedLock extends Model<AuthorizedLock> {
  @Column
  address!: string

  @Column
  authorizedAt!: Date
}
