import { Table, Column, Model, DataType } from 'sequelize-typescript'

interface UserTokenMetadataAttributes {
  tokenAddress: string
  userAddress: string
  data: any
  chain: number
}

@Table({ tableName: 'UserTokenMetadata', timestamps: true })
export class UserTokenMetadata extends Model<UserTokenMetadataAttributes> {
  @Column({
    unique: 'token_user_address_unique_constraint',
  })
  tokenAddress!: string

  @Column({
    unique: 'token_user_address_unique_constraint',
  })
  userAddress!: string

  @Column(DataType.JSONB)
  data!: any

  @Column
  chain!: number
}
