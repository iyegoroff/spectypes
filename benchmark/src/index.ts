import { Event, Suite } from 'benchmark'
import Ajv from 'ajv'
import { boolean, number, object, record, string, unknown, merge, struct } from 'spectypes'
import { merge as mergeAnything } from 'merge-anything'

const data = {
  object: Object.freeze({
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
}

const spectypesStrictAssertion = object({
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

const spectypesStruct = struct({
  number,
  negNumber: number,
  maxNumber: number,
  string,
  longString: string,
  boolean,
  deeplyNested: struct({
    foo: string,
    num: number,
    bool: boolean
  })
})

const spectypesLooseAssertion = merge(
  object({
    number,
    negNumber: number,
    maxNumber: number,
    string,
    longString: string,
    boolean,
    deeplyNested: merge(
      object({
        foo: string,
        num: number,
        bool: boolean
      }),
      record(unknown)
    )
  }),
  record(unknown)
)

const ajv = new Ajv()
const ajvLooseAssertionSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    number: {
      type: 'number'
    },
    negNumber: {
      type: 'number'
    },
    maxNumber: {
      type: 'number'
    },
    string: {
      type: 'string'
    },
    longString: {
      type: 'string'
    },
    boolean: {
      type: 'boolean'
    },
    deeplyNested: {
      type: 'object',
      properties: {
        foo: {
          type: 'string'
        },
        num: {
          type: 'number'
        },
        bool: {
          type: 'boolean'
        }
      },
      required: ['foo', 'num', 'bool']
    }
  },
  required: ['number', 'negNumber', 'maxNumber', 'string', 'longString', 'boolean', 'deeplyNested']
}
const ajvLooseAssertion = ajv.compile(ajvLooseAssertionSchema)

const ajvStrictAssertion = ajv.compile(
  mergeAnything(ajvLooseAssertionSchema, {
    properties: {
      deeplyNested: {
        additionalProperties: false
      }
    },
    additionalProperties: false
  })
)

// console.log(spectypesStruct(data.object))
// console.log(spectypesLooseAssertion(data.object))
// console.log(spectypesStrictAssertion(data.object))
// console.log(ajvStrictAssertion(data.object))
// console.log(ajvLooseAssertion(data.object))

const suite = new Suite()

suite
  .add('ajv - strict assertion', () => {
    const checked = ajvStrictAssertion(data.object)
    if (!checked) {
      throw new Error(JSON.stringify(ajvStrictAssertion.errors))
    }
  })
  .add('spectypes - strict assertion', () => {
    const checked = spectypesStrictAssertion(data.object)
    if (checked.tag === 'failure') {
      throw new Error(JSON.stringify(checked.failure))
    }
  })
  .add('spectypes - struct assertion', () => {
    const checked = spectypesStruct(data.object)
    if (checked.tag === 'failure') {
      throw new Error(JSON.stringify(checked.failure))
    }
  })
  .add('ajv - loose assertion', () => {
    const checked = ajvLooseAssertion(data.object)
    if (!checked) {
      throw new Error(JSON.stringify(ajvLooseAssertion.errors))
    }
  })
  .add('spectypes - loose assertion', () => {
    const checked = spectypesLooseAssertion(data.object)
    if (checked.tag === 'failure') {
      throw new Error(JSON.stringify(checked.failure))
    }
  })
  .on('cycle', (event: Event) => {
    console.log(String(event.target))
  })
  .run({
    async: true
  })
