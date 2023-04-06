import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model } from 'sequelize'
import { sequelize, LocksmithLocksmithDataTypes } from './sequelize'

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare publicKey: string
  declare recoveryPhrase: string | null
  declare passwordEncryptedPrivateKey: any
  declare ejection?: CreationOptional<Date> | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

User.init(
  {
    publicKey: {
      type: LocksmithDataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    recoveryPhrase: {
      type: LocksmithDataTypes.STRING,
      allowNull: false,
    },
    passwordEncryptedPrivateKey: {
      type: LocksmithDataTypes.JSON,
      allowNull: false,
    },
    ejection: {
      type: LocksmithDataTypes.DATE,
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
    modelName: 'Users',
  }
)
