import { Table, Column, Model, DataType } from 'sequelize-typescript'

export interface UserAttributes {
  publicKey: string
  recoveryPhrase: string
  passwordEncryptedPrivateKey: any
  ejection?: Date
}

@Table({ tableName: 'Users', timestamps: true })
export class User extends Model<UserAttributes> {
  @Column
  publicKey!: string

  @Column
  recoveryPhrase!: string

  @Column(DataType.JSON)
  passwordEncryptedPrivateKey!: JSON

  @Column
  ejection!: Date
}
