import { array, number, struct, string, literal, template, optional } from 'spectypes'
import { transformer, lazy, map, limit } from 'spectypes'

const product = lazy(() => limit(
  struct({
    name: map(string, name => name.toUpperCase()),
    price: limit(number, price => price > 0),
    id: template(string, literal('-'), string, literal('-'), number),
    contents: optional(array(transformer(product)))
  }),
  prod => (
    prod.contents === undefined || prod.price === prod.contents.reduce((sum, p) => sum + p.price,0)
  )
))
