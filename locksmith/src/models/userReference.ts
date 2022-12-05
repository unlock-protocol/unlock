import { Table, Column, Model, BelongsTo } from 'sequelize-typescript'
import { User, UserAttributes } from './user'

interface UserReferenceAttributes {
  emailAddress: string
  User: UserAttributes
  publicKey?: string
  stripe_customer_id?: string | null
}

@Table({ tableName: 'UserReferences', timestamps: true })
export class UserReference extends Model<UserReferenceAttributes> {
  @Column
  emailAddress!: string

  @BelongsTo(() => User, { foreignKey: 'publicKey', targetKey: 'publicKey' })
  User!: User

  @Column
  publicKey!: string

  @Column
  stripe_customer_id!: string // TODO: deprecated!
}
