import * as Sequelize from 'sequelize'
import EventOperations from '../../src/operations/eventOperations'

const models = require('../../src/models')

const Op = Sequelize.Op

let Event: any = models.Event
let eventData = {
  lockAddress: '0x49158d35259e3264ad2a6abb300cda19294d125e',
  name: 'A Test Event',
  description: 'A fun event for everyone',
  location: 'http://example.com/a_sample_location',
  date: 1744487946000,
  logo: 'http://example.com/a_logo',
  owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
}

describe('EventOperations', () => {
  describe('create', () => {
    it('dispatches to the event model with normalized addresses', () => {
      expect.assertions(1)
      Event.create = jest.fn(() => {})
      EventOperations.create(eventData)
      expect(Event.create).toHaveBeenCalledWith({
        date: 1744487946000,
        description: 'A fun event for everyone',
        location: 'http://example.com/a_sample_location',
        lockAddress: '0x49158d35259E3264Ad2a6aBb300cdA19294D125e',
        logo: 'http://example.com/a_logo',
        name: 'A Test Event',
        owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
      })
    })
  })
  describe('update', () => {
    it('dispatches to the event model with a normalized address', () => {
      expect.assertions(1)
      Event.update = jest.fn(() => {})
      EventOperations.update(eventData)
      expect(Event.update).toHaveBeenCalledWith(
        {
          date: 1744487946000,
          description: 'A fun event for everyone',
          location: 'http://example.com/a_sample_location',
          lockAddress: '0x49158d35259E3264Ad2a6aBb300cdA19294D125e',
          logo: 'http://example.com/a_logo',
          name: 'A Test Event',
          owner: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
        },
        {
          where: {
            address: {
              [Op.eq]: '0x49158d35259E3264Ad2a6aBb300cdA19294D125e',
            },
            owner: {
              [Op.eq]: '0xaaadeed4c0b861cb36f4ce006a9c90ba2e43fdc2',
            },
          },
          raw: true,
        }
      )
    })
  })
  describe('find', () => {
    it('dispatches to the event model with a normalized address', () => {
      expect.assertions(1)
      Event.findOne = jest.fn(() => {})
      EventOperations.find('0x49158d35259e3264ad2a6abb300cda19294d125e')
      expect(Event.findOne).toHaveBeenCalledWith({
        where: {
          lockAddress: {
            [Op.eq]: '0x49158d35259E3264Ad2a6aBb300cdA19294D125e',
          },
        },
      })
    })
  })
})
