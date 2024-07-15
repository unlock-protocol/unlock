import { Model, DataTypes } from 'sequelize'
import { sequelize } from './sequelize'

class VerificationCodes extends Model {
  declare id: string
  declare emailAddress: string
  declare code: string
  declare codeExpiration: Date
  declare createdAt: Date
  declare updatedAt: Date
}

VerificationCodes.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    codeExpiration: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'VerificationCodes',
    timestamps: true,
  }
)

export default VerificationCodes
