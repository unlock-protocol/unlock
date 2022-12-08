import type {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

export class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User>
> {
  declare publicKey: string
  declare recoveryPhrase: string
  declare passwordEncryptedPrivateKey: any
  declare ejection?: CreationOptional<Date>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

User.init(
  {
    publicKey: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    recoveryPhrase: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordEncryptedPrivateKey: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    ejection: {
      type: DataTypes.DATE,
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
    modelName: 'Users',
  }
)
