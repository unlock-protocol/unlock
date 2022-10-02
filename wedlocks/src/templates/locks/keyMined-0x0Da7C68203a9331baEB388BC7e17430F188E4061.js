import handlebars from 'handlebars'
import { TypePredicateKind } from 'typescript'

export default {
  nowrap: true,
  subject: handlebars.compile('You are going to LaDegen!'),
  html: handlebars.compile(`<h1>ool<h1>`),
}
