import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { UUID } from 'crypto'
import { sequelize } from './sequelize'

export class NextAuthSession extends Model<
  InferAttributes<NextAuthSession>,
  InferCreationAttributes<NextAuthSession>
> {
  declare id: UUID
  declare userId: UUID
  declare UserId: UUID // This field is not used in the codebase, but it is required by NextAuth
  declare expires: Date
  declare sessionToken: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

NextAuthSession.init(
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      references: { model: 'NextAuthUser', key: 'id' },
      onDelete: 'CASCADE',
    },
    UserId: {
      type: DataTypes.UUID,
    },
    expires: {
      type: DataTypes.DATE,
    },
    sessionToken: {
      type: DataTypes.STRING,
      unique: true,
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
    modelName: 'NextAuthSession',
    tableName: 'NextAuthSession',
  }
)
