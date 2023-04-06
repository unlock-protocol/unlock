import { User } from './user'
import type {
  Association,
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

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
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    publicKey: {
      type: DataTypes.STRING,
      references: {
        model: 'Users',
        key: 'publicKey',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    stripe_customer_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
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
