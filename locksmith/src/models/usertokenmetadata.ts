import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({ tableName: 'UserTokenMetadata', timestamps: true })
export class UserTokenMetadata extends Model<UserTokenMetadata> {
  @Column({ unique: 'token_user_address_unique_constraint' })
  tokenAddress!: string

  @Column({ unique: 'token_user_address_unique_constraint' })
  userAddress!: string

  @Column(DataType.JSONB)
  data!: any

  @Column
  chain!: number
}
