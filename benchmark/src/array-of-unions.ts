import { Suite } from 'benchmark'
import Ajv from 'ajv'
import { array, boolean, number, string, union } from 'spectypes'
import { ajvVersion, spectypesVersion } from './versions'
import { ajvTest, onComplete, onCycle, onStart, spectypesTest } from './util'

const data = Object.freeze(
  Array(100)
    .fill(0)
    .map((_: number, idx) => ['test', 123, false][idx % 3] ?? true)
)

/** -------------------------------------------- ajv -------------------------------------------- */

const ajvSchema = {
  type: 'array',
  items: { anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }] }
}

const ajvCheck = new Ajv().compile(ajvSchema)

/** ----------------------------------------- spectypes ----------------------------------------- */

const spectypesCheck = array(union(string, number, boolean))

/** --------------------------------------------------------------------------------------------- */

const invalidData = [{}, 123, undefined, [1, true, '23', { foo: 1 }]] as const

ajvTest(ajvCheck, data, invalidData)
spectypesTest(spectypesCheck, data, invalidData)

export const arrayOfUnions = new Suite()
  .add(ajvVersion, () => ajvCheck(data))
  .add(spectypesVersion, () => spectypesCheck(data).tag === 'success')
  .on('start', onStart('array of unions'))
  .on('cycle', onCycle)
  .on('complete', onComplete)
