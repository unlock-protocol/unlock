import { Table, Column, Model, DataType } from 'sequelize-typescript'

@Table({ tableName: 'Users', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class User extends Model<User> {
  @Column
  publicKey!: string

  @Column
  recoveryPhrase!: string

  @Column(DataType.JSON)
  passwordEncryptedPrivateKey!: JSON

  @Column
  ejection!: Date
}
