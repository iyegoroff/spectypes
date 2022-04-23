import { arrayOfUnions } from './array-of-unions'
import { nestedObject } from './nested-object'
;[arrayOfUnions, nestedObject]
  .reduce((acc, val) => val.on('complete', () => acc.run({ async: true })))
  .run({ async: true })
