import Model, { Table, Column, BelongsTo } from './sequelize'
import { User } from './user'

@Table({ tableName: 'UserReferences', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class UserReference extends Model<UserReference> {
  @Column
  emailAddress!: string

  @BelongsTo(() => User, { foreignKey: 'publicKey', targetKey: 'publicKey' })
  User!: User

  @Column
  publicKey!: string

  @Column
  stripe_customer_id!: string // TODO: deprecated!
}
