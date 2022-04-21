import { Event, Suite } from 'benchmark'
import Ajv from 'ajv'
import { array, boolean, number, object, string, union } from 'spectypes'

const obj = Object.freeze({
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

const arrayUnion = Object.freeze(
  Array(100)
    .fill(0)
    .map((_: number, idx) => ['test', 123, false][idx % 3] ?? true)
)

const spectypesObject = object({
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

const ajv = new Ajv()
const ajvObjectSchema = {
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
      required: ['foo', 'num', 'bool'],
      additionalProperties: false
    }
  },
  required: ['number', 'negNumber', 'maxNumber', 'string', 'longString', 'boolean', 'deeplyNested'],
  additionalProperties: false
}

const ajvObject = ajv.compile(ajvObjectSchema)

const spectypesArrayUnion = array(union(string, number, boolean))

const ajvArrayUnionShema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'array',
  items: {
    anyOf: [{ type: 'string' }, { type: 'number' }, { type: 'boolean' }]
  }
}

const ajvArrayUnion = ajv.compile(ajvArrayUnionShema)

const arrayUnionValidation = new Suite()

arrayUnionValidation
  .add('ajv', () => {
    const checked = ajvArrayUnion(arrayUnion)
    if (!checked) {
      throw new Error(JSON.stringify(ajvObject.errors))
    }
  })
  .add('spectypes', () => {
    const checked = spectypesArrayUnion(arrayUnion)
    if (checked.tag === 'failure') {
      throw new Error(JSON.stringify(checked.failure))
    }
  })
  .on('start', () => {
    console.log('array of unions validation:</br>')
  })
  .on('cycle', (event: Event) => {
    console.log(`${String(event.target)}</br>`)
  })
  .on('complete', ({ currentTarget }: { currentTarget: unknown }) => {
    if (currentTarget instanceof Suite) {
      console.log(`Fastest is ${String(currentTarget.filter('fastest').map('name')[0])}</br>`)
    }
  })

const objectValidation = new Suite()

objectValidation
  .add('ajv', () => {
    const checked = ajvObject(obj)
    if (!checked) {
      throw new Error(JSON.stringify(ajvObject.errors))
    }
  })
  .add('spectypes', () => {
    const checked = spectypesObject(obj)
    if (checked.tag === 'failure') {
      throw new Error(JSON.stringify(checked.failure))
    }
  })
  .on('start', () => {
    console.log('object validation:</br>')
  })
  .on('cycle', (event: Event) => {
    console.log(`${String(event.target)}</br>`)
  })
  .on('complete', ({ currentTarget }: { currentTarget: unknown }) => {
    if (currentTarget instanceof Suite) {
      console.log(`Fastest is ${String(currentTarget.filter('fastest').map('name')[0])}</br>`)
    }

    console.log()
    arrayUnionValidation.run({ async: true })
  })
  .run({ async: true })
