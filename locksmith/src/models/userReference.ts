import { User } from './user'
import type {
  Association,
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize'
import { Model } from 'sequelize'
import { sequelize, LocksmithDataTypes } from './sequelize'

export class UserReference extends Model<
  InferAttributes<UserReference>,
  InferCreationAttributes<UserReference>
> {
  declare emailAddress: string
  declare publicKey: ForeignKey<User['publicKey']>
  declare User?: NonAttribute<User>
  declare stripe_customer_id?: string | null // TODO: deprecated!
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  public static associations: { User: Association<UserReference, User> }
}

UserReference.init(
  {
    emailAddress: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    publicKey: {
      type: LocksmithDataTypes.STRING,
      references: {
        model: 'Users',
        key: 'publicKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    stripe_customer_id: {
      type: LocksmithDataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      allowNull: false,
      type: LocksmithDataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: LocksmithDataTypes.DATE,
    },
  },
  {
    sequelize,
    modelName: 'UserReferences',
  }
)

UserReference.belongsTo(User, {
  foreignKey: 'publicKey',
  targetKey: 'publicKey',
})
