import {
  Table,
  Model,
  Column,
  BelongsTo,
  ForeignKey,
} from 'sequelize-typescript'
import { Event } from './event' // eslint-disable-line import/no-cycle
@Table({ tableName: 'EventLinks', timestamps: true })
// eslint-disable-next-line import/prefer-default-export
export class EventLink extends Model<EventLink> {
  @Column
  text!: string

  @Column
  href!: string

  @ForeignKey(() => Event)
  @Column
  eventId!: number

  @BelongsTo(() => Event, 'eventId')
  event!: Event
}
