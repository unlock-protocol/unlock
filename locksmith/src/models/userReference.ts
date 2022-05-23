import { Table, Column, Model, BelongsTo } from 'sequelize-typescript'
import { User } from './user'

@Table({ tableName: 'UserReferences', timestamps: true })
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
