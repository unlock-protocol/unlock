import { User } from './user'
import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'
import { UserAccountType } from '../controllers/userController'

export class UserAccount extends Model<
  InferAttributes<UserAccount>,
  InferCreationAttributes<UserAccount>
> {
  declare emailAddress: string
  declare loginMethod: UserAccountType
  declare User?: NonAttribute<User>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

UserAccount.init(
  {
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    loginMethod: {
      type: DataTypes.ENUM(
        'unlockAccount',
        'googleAccount',
        'passkeyAccout',
        'emailCodeAccount',
        'none'
      ),
      allowNull: false,
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
    modelName: 'UserAccount',
  }
)
