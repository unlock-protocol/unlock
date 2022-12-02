import { Table, Column, Model } from 'sequelize-typescript'

interface RefreshTokenAttributes {
  id: number
  token: string
  nonce: string
  revoked: boolean | null
  walletAddress: string
}

@Table({
  tableName: 'RefreshTokens',
  timestamps: true,
})
export class RefreshToken extends Model<RefreshTokenAttributes> {
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
