import { Table, Model, Column, DataType, HasMany } from 'sequelize-typescript'
import { EventLink } from './eventLink' // eslint-disable-line import/no-cycle
@Table({ tableName: 'Events', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class Event extends Model<Event> {
  @Column
  lockAddress!: string

  @Column
  name!: string

  @Column(DataType.TEXT)
  description!: string

  @Column
  location!: string

  @Column
  date!: Date

  @Column
  logo!: string

  @Column
  owner!: string

  @Column
  duration!: number

  @Column
  image!: string

  @HasMany(() => EventLink)
  eventLinks!: EventLink[]
}
