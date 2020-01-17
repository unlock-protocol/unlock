import { Table, Model, Column } from 'sequelize-typescript'

@Table({ tableName: 'EmailDispatch', timestamps: true })
export class EmailDispatch extends Model<EmailDispatch> {
  @Column
  lockAddress!: string

  @Column
  keyId!: string

  @Column
  emailAddress!: string
}
