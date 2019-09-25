import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({ tableName: 'UserTokenMetadata', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class UserTokenMetadata extends Model<UserTokenMetadata> {
  @Column
  tokenAddress!: string

  @Column
  userAddress!: string

  @Column(DataType.JSON)
  data!: any
}
