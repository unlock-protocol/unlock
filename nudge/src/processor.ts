import { extractEmails } from './emailList'
import { Querier } from './querier'
import * as Dispatcher from './dispatcher'

export class Processor {
  graphQLEndpoint: string

  constructor(graphQLEndpoint: string) {
    this.graphQLEndpoint = graphQLEndpoint
  }

  async processKey(key: Key) {
    if (!(await Dispatcher.check(key))){
      if (await Dispatcher.dispatch(key)) {
        await Dispatcher.record(key)
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  async processKeys() {
    let querier = new Querier(this.graphQLEndpoint)
    let results = await querier.query()
    let newKeys = await extractEmails(results)

    newKeys.forEach(async key => {
      await this.processKey(key)
    })
  }
}
