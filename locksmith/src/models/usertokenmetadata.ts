import Model, { Table, Column, DataType } from './sequelize'

@Table({ tableName: 'UserTokenMetadata', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class UserTokenMetadata extends Model<UserTokenMetadata> {
  @Column({ unique: 'token_user_address_unique_constraint' })
  tokenAddress!: string

  @Column({ unique: 'token_user_address_unique_constraint' })
  userAddress!: string

  @Column(DataType.JSON)
  data!: any

  @Column
  chain!: number
}
