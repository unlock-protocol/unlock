import handlebars from 'handlebars'
import { TypePredicateKind } from 'typescript'
import prepare from '../prepare'

let images = []
const [html, getImages] = prepare(`<h1>ool<h1><img src="{{inlineImage 'bomdia.png'}}"/>`)

export default {
  nowrap: true,
  subject: handlebars.compile('You are going to LaDegen!'),
  html,
  attachements: getImages()
}
