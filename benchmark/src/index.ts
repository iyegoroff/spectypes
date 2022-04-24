import { arrayOfUnions } from './array-of-unions'
import { nestedObject } from './nested-object'
import { objectWithConstraints } from './object-with-constraints'

console.log('## Benchmarking with benchmark.js')
;[arrayOfUnions, nestedObject, objectWithConstraints]
  .reduce((acc, val) => val.on('complete', () => acc.run({ async: true })))
  .run({ async: true })
