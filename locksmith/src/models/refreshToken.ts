import { Table, Column, Model } from 'sequelize-typescript'

@Table({
  tableName: 'RefreshTokens',
  timestamps: true,
})
export class RefreshToken extends Model<RefreshToken> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number

  @Column
  token!: string

  @Column
  nonce!: string

  @Column
  revoked!: boolean

  @Column
  walletAddress!: string
}
