import { Table, Column, Model, DataType } from 'sequelize-typescript'

interface UserTokenMetadataAttributes {
  tokenAddress: string
  userAddress: string
  data: any
  chain: number
}

@Table({ tableName: 'UserTokenMetadata', timestamps: true })
export class UserTokenMetadata extends Model<UserTokenMetadataAttributes> {
  @Column
  tokenAddress!: string

  @Column
  userAddress!: string

  @Column(DataType.JSON)
  data!: any

  @Column
  chain!: number
}
