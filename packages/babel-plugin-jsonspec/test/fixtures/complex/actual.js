import { array, number, object, string, union, literal, limit, optional } from 'jsonspec'

const persons = array(
  object({
    name: string,
    age: limit(number, age => age >= 0),
    hobby: optional(union(literal('coding'), literal('poetry'), literal('music'))),
    properties: array(
      union(
        object({ tag: literal('house'), address: string }),
        object({ tag: literal('car'), model: string })
      )
    )
  })
)
