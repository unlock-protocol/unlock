import Model, { Table, Column, Validate } from './sequelize'

@Table({ tableName: 'ProcessedHookItems', timestamps: true })
export class ProcessedHookItem extends Model<ProcessedHookItem> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number

  @Column
  network!: number

  // This is only code side validation so we can add more types in future without changing the migration for database.
  @Validate({
    isIn: [['lock', 'key']],
  })
  @Column
  type!: string

  @Column
  objectId!: string
}
