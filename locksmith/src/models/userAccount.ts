import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'
import { UserAccountType } from '../controllers/userController'
import { UUID } from 'crypto'

export class UserAccount extends Model<
  InferAttributes<UserAccount>,
  InferCreationAttributes<UserAccount>
> {
  declare id: UUID
  declare emailAddress: string
  declare loginMethod: UserAccountType[]
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

UserAccount.init(
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    loginMethod: {
      type: DataTypes.ARRAY(
        DataTypes.ENUM(
          'UNLOCK_ACCOUNT',
          'GOOGLE_ACCOUNT',
          'PASSKEY_ACCOUNT',
          'EMAIL_CODE',
          'NONE'
        )
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
