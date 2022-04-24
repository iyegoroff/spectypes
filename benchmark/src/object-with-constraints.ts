import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import { fullFormats } from 'ajv-formats/dist/formats'
import { Suite } from 'benchmark'
import { limit, number, object, string } from 'spectypes'
import { ajvTest, onComplete, onCycle, onStart, spectypesTest } from './util'
import { ajvVersion, spectypesVersion } from './versions'

const data = Object.freeze({
  name: 'John Doe',
  email: 'john.doe@company.space',
  firstName: 'John',
  phone: '123-4567',
  age: 33
})

const emailRegexp =
  fullFormats.email instanceof RegExp
    ? fullFormats.email
    : (() => {
        throw new Error('ajv-formats fullFormats.email is not RegExp!')
      })()

/** -------------------------------------------- ajv -------------------------------------------- */

const ajvSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 4, maxLength: 25 },
    email: { type: 'string', format: 'email' },
    firstName: { type: 'string' },
    phone: { type: 'string' },
    age: { type: 'integer', minimum: 18 }
  },
  required: ['name', 'email', 'firstName', 'phone', 'age'],
  additionalProperties: false
}

const ajvCheck = addFormats(new Ajv()).compile(ajvSchema)

/** ----------------------------------------- spectypes ----------------------------------------- */

const spectypesEmailRegexp = new RegExp(emailRegexp)

const spectypesCheck = object({
  name: limit(string, ({ length }) => length >= 4 && length <= 25),
  email: limit(string, (x) => spectypesEmailRegexp.test(x)),
  firstName: string,
  phone: string,
  age: limit(number, (x) => x % 1 === 0 && x >= 18)
})

/** --------------------------------------------------------------------------------------------- */

const invalidData = [
  {},
  [],
  12321,
  undefined,
  { ...data, test: 'test' },
  { ...data, phone: 12345 },
  { ...data, name: 'foo' },
  { ...data, email: 'this.is.email' },
  { ...data, age: 25.5 }
] as const

ajvTest(ajvCheck, data, invalidData)
spectypesTest(spectypesCheck, data, invalidData)

export const objectWithConstraints = new Suite()
  .add(ajvVersion, () => ajvCheck(data))
  .add(spectypesVersion, () => spectypesCheck(data).tag === 'success')
  .on('start', onStart('object with constraints'))
  .on('cycle', onCycle)
  .on('complete', onComplete)
