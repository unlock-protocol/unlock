import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  saveContractOnEventCasterEvent,
  saveTokenOnEventCasterRSVP,
} from '../../src/operations/eventCasterOperations'

describe('saveContractOnEventCasterEvent', () => {
  beforeEach(() => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        address: '0x662208945C988B1769d493d94e4DFdc9c681B6fF',
        event_id: 'e7618561-dbb5-4b0d-81dd-5101e5c9729f',
        network: 84532,
        success: true,
      }),
      {
        status: 200,
      }
    )
  })
  it("shoud call the EventCaster API to save the contract's address", async () => {
    const result = await saveContractOnEventCasterEvent({
      eventId: 'e76185',
      contract: '0x662208945C988B1769d493d94e4DFdc9c681B6fF',
      network: 84532,
    })
    expect(result).toEqual({
      address: '0x662208945C988B1769d493d94e4DFdc9c681B6fF',
      event_id: 'e7618561-dbb5-4b0d-81dd-5101e5c9729f',
      network: 84532,
      success: true,
    })
  })
})

describe('saveTokenOnEventCasterRSVP', () => {
  beforeEach(() => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        event_id: 'e7618561-dbb5-4b0d-81dd-5101e5c9729f',
        fid: 6801,
        rsvp_id: '360ad3c1-33d9-469a-a5b2-7785c88dd2b5',
        success: true,
        token_id: '5656',
      }),
      {
        status: 200,
      }
    )
  })

  it('should update the token id for an RSVP to an event on EventCaster', async () => {
    const result = await saveTokenOnEventCasterRSVP({
      eventId: 'e76185',
      farcasterId: '6801',
      tokenId: '5656',
    })
    expect(result).toEqual({
      event_id: 'e7618561-dbb5-4b0d-81dd-5101e5c9729f',
      fid: 6801,
      rsvp_id: '360ad3c1-33d9-469a-a5b2-7785c88dd2b5',
      success: true,
      token_id: '5656',
    })
  })
})
