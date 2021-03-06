import { Suite } from 'benchmark'
import Ajv from 'ajv'
import { boolean, number, object, string } from 'spectypes'
import { ajvVersion, spectypesVersion } from './versions'
import { ajvTest, onComplete, onCycle, onStart, spectypesTest } from './util'

const data = Object.freeze({
  number: 1,
  negNumber: -1,
  maxNumber: Number.MAX_VALUE,
  string: 'string',
  longString:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Vivendum intellegat et qui, ei denique consequuntur vix. Semper aeterno percipit ut his, sea ex utinam referrentur repudiandae. No epicuri hendrerit consetetur sit, sit dicta adipiscing ex, in facete detracto deterruisset duo. Quot populo ad qui. Sit fugit nostrum et. Ad per diam dicant interesset, lorem iusto sensibus ut sed. No dicam aperiam vis. Pri posse graeco definitiones cu, id eam populo quaestio adipiscing, usu quod malorum te. Ex nam agam veri, dicunt efficiantur ad qui, ad legere adversarium sit. Commune platonem mel id, brute adipiscing duo an. Vivendum intellegat et qui, ei denique consequuntur vix. Offendit eleifend moderatius ex vix, quem odio mazim et qui, purto expetendis cotidieque quo cu, veri persius vituperata ei nec. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  boolean: true,
  deeplyNested: {
    foo: 'bar',
    num: 1,
    bool: false
  }
})

/** -------------------------------------------- ajv -------------------------------------------- */

const ajvSchema = {
  type: 'object',
  properties: {
    number: { type: 'number' },
    negNumber: { type: 'number' },
    maxNumber: { type: 'number' },
    string: { type: 'string' },
    longString: { type: 'string' },
    boolean: { type: 'boolean' },
    deeplyNested: {
      type: 'object',
      properties: {
        foo: { type: 'string' },
        num: { type: 'number' },
        bool: { type: 'boolean' }
      },
      required: ['foo', 'num', 'bool'],
      additionalProperties: false
    }
  },
  required: ['number', 'negNumber', 'maxNumber', 'string', 'longString', 'boolean', 'deeplyNested'],
  additionalProperties: false
}

const ajvCheck = new Ajv().compile(ajvSchema)

/** ----------------------------------------- spectypes ----------------------------------------- */

const spectypesCheck = object({
  number,
  negNumber: number,
  maxNumber: number,
  string,
  longString: string,
  boolean,
  deeplyNested: object({
    foo: string,
    num: number,
    bool: boolean
  })
})

/** --------------------------------------------------------------------------------------------- */

const invalidData = [
  {},
  123,
  undefined,
  [],
  { ...data, foo: 1 },
  { ...data, string: 123 },
  { ...data, deeplyNested: { ...data.deeplyNested, foo: [] } },
  { ...data, deeplyNested: { ...data.deeplyNested, bar: undefined } }
] as const

ajvTest(ajvCheck, data, invalidData)
spectypesTest(spectypesCheck, data, invalidData)

export const nestedObject = new Suite()
  .add(ajvVersion, () => ajvCheck(data))
  .add(spectypesVersion, () => spectypesCheck(data).tag === 'success')
  .on('start', onStart('nested object'))
  .on('cycle', onCycle)
  .on('complete', onComplete)
