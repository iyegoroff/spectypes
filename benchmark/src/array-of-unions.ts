import { Suite } from 'benchmark'
import Ajv from 'ajv'
// import Validator from 'fastest-validator'
import { array, boolean, number, string, union } from 'spectypes'
import { ajvVersion, spectypesVersion } from './versions'
import { ajvCase, onComplete, onCycle, onStart, spectypesCase } from './util'

const arrayUnion = Object.freeze(
  Array(100)
    .fill(0)
    .map((_: number, idx) => ['test', 123, false][idx % 3] ?? true)
)

const spectypesArrayUnion = array(union(string, number, boolean))

const ajvArrayUnionShema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'array',
  items: {
    anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }]
  }
}

const ajv = new Ajv()
const ajvArrayUnion = ajv.compile(ajvArrayUnionShema)

export const arrayOfUnions = new Suite()
  .add(ajvVersion, ajvCase(ajvArrayUnion, arrayUnion))
  .add(spectypesVersion, spectypesCase(spectypesArrayUnion, arrayUnion))
  .on('start', onStart('array of unions'))
  .on('cycle', onCycle)
  .on('complete', onComplete)
