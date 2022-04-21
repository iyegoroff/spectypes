# spectypes

[![npm](https://img.shields.io/npm/v/spectypes)](https://npm.im/spectypes)
[![build](https://github.com/iyegoroff/spectypes/workflows/build/badge.svg)](https://github.com/iyegoroff/spectypes/actions/workflows/build.yml)
[![publish](https://github.com/iyegoroff/spectypes/workflows/publish/badge.svg)](https://github.com/iyegoroff/spectypes/actions/workflows/publish.yml)
[![codecov](https://codecov.io/gh/iyegoroff/spectypes/branch/main/graph/badge.svg?t=1520230083925)](https://codecov.io/gh/iyegoroff/spectypes)
[![Type Coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fiyegoroff%2Fspectypes%2Fmain%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/spectypes)
[![npm](https://img.shields.io/npm/l/spectypes.svg?t=1495378566925)](https://www.npmjs.com/package/spectypes)

Fast, compiled, eval-free data validator/transformer

---

## Features

- <b>really fast</b>, can be even [faster](/benchmark) than `ajv`
- <b>detailed errors</b>, failure will result into explicit error message(s) and path to invalid data
- <b>extensively tested</b>, each release undergoes more than 900 `fast-check` powered [tests](#how-is-it-tested)
- <b>precise types</b>, accurately infers all types and provides readable compile-time error messages
- <b>browser friendly</b>, uses `babel` to compile validators, so no `eval` or `new Function` involved
- <b>easily extensible</b>, [custom validators](#custom-validators) are created by mixing existing ones

## Getting started

1. There are two packages to install - `spectypes`, which contains type definitions and small set of runtime helpers and `babel-plugin-spectypes`, which parses and compiles validators into functions:

   ```
   npm i spectypes
   npm i babel-plugin-spectypes -D
   ```

2. Add `babel-plugin-spectypes` to plugins section in your `babel` config:

   ```diff
   "plugins": [
   +  "babel-plugin-spectypes"
   ]
   ```

## Example

```ts
import { array, number } from 'spectypes'

const check = array(number)

expect(check([1, 2, 3])).toEqual({
  tag: 'success',
  success: [1, 2, 3] // readonly number[]
})

expect(check({ 0: 1 })).toEqual({
  tag: 'failure',
  failure: {
    value: { 0: 1 }, // unknown
    errors: [{ issue: 'not an array', path: [] }]
  }
})

expect(check([1, 2, '3', false])).toEqual({
  tag: 'failure',
  failure: {
    value: [1, 2, '3', false], // unknown
    errors: [
      { issue: 'not a number', path: [2] },
      { issue: 'not a number', path: [3] }
    ]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes';

const check = (value) => {
  let err

  if (!Array.isArray(value)) {
    ;(err = err || []).push({
      issue: 'not an array',
      path: []
    })
  } else {
    for (let index = 0; index < value.length; index++) {
      const value_index = value[index]

      if (typeof value_index !== 'number') {
        ;(err = err || []).push({
          issue: 'not a number',
          path: [index]
        })
      }
    }
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}

...
```

</details>

## Reference

- [array](#array)
- [boolean](#boolean)
- [filter](#filter)
- [lazy](#lazy)
- [limit](#limit)
- [literal](#literal)
- [map](#map)
- [merge](#merge)
- [nullish](#nullish)
- [number](#number)
- [object](#object)
- [optional](#optional)
- [record](#record)
- [string](#string)
- [struct](#struct)
- [template](#template)
- [transformer](#transformer)
- [tuple](#tuple)
- [union](#union)
- [unknown](#unknown)
- [validator](#validator)
- [writable](#writable)
- [Spectype](#Spectype)

### Primitive validators

#### boolean

Validates a boolean value

```ts
import { boolean } from 'spectypes'

const check = boolean

expect(check(true)).toEqual({
  tag: 'success',
  success: true
})

expect(check('false')).toEqual({
  tag: 'failure',
  failure: {
    value: 'false',
    errors: [{ issue: 'not a boolean', path: [] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err

  if (typeof value !== 'boolean') {
    ;(err = err || []).push({
      issue: 'not a boolean',
      path: []
    })
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}
```

</details>

#### literal

Creates a literal validator spec. `literal`can validate strings, numbers, booleans, undefined and null. `literal(undefined)` is treated [specially](#special-cases) when used as a property validator inside `object` or `struct`.

```ts
import { literal } from 'spectypes'

const check = literal('test')

expect(check('test')).toEqual({
  tag: 'success',
  success: 'test'
})

expect(check('temp')).toEqual({
  tag: 'failure',
  failure: {
    value: 'temp',
    errors: [{ issue: "not a 'test' string literal", path: [] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err

  if (value !== 'test') {
    ;(err = err || []).push({
      issue: "not a '" + 'test' + "' string literal",
      path: []
    })
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}
```

</details>

#### nullish

Transformer spec, that accepts `undefined` and `null` values and maps them to `undefined`.
`nullish` is treated [specially](#special-cases) when used as a property validator inside `object` or `struct`.

```ts
import { nullish } from 'spectypes'

const check = nullish

expect(check(undefined)).toEqual({
  tag: 'success'
  success: undefined
})

expect(check(null)).toEqual({
  tag: 'success'
  success: undefined
})

expect(check(123)).toEqual({
  tag: 'failure',
  failure: {
    value: 'temp',
    errors: [{ issue: "not 'null' or 'undefined'", path: [] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err, result

  if (value !== null && value !== undefined) {
    ;(err = err || []).push({
      issue: "not 'null' or 'undefined'",
      path: []
    })
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: result }
}
```

</details>

#### number

Validates a number value.

```ts
import { number } from 'spectypes'

const check = number

expect(check(0)).toEqual({
  tag: 'success',
  success: 0
})

expect(check({})).toEqual({
  tag: 'failure',
  failure: {
    value: {},
    errors: [{ issue: 'not a number', path: [] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err

  if (typeof value !== 'number') {
    ;(err = err || []).push({
      issue: 'not a number',
      path: []
    })
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}
```

</details>

#### string

Validates a string value.

```ts
import { string } from 'spectypes'

const check = string

expect(check('')).toEqual({
  tag: 'success',
  success: ''
})

expect(check(null)).toEqual({
  tag: 'failure',
  failure: {
    value: null,
    errors: [{ issue: 'not a string', path: [] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err

  if (typeof value !== 'string') {
    ;(err = err || []).push({
      issue: 'not a string',
      path: []
    })
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}
```

</details>

#### unknown

Empty validator spec. `unknown` is treated [specially](#special-cases) when used as a property validator inside `object` or `struct`.

```ts
import { unknown } from 'spectypes'

const check = unknown

expect(check('anything')).toEqual({
  tag: 'success',
  success: 'anything'
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err
  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}
```

</details>

### Complex validators

#### array

Creates an array validator spec. Takes a spec to validate each item of an array.

See [example](#example)

#### filter

Can be used only as an argument for `array` and `record` to create filtered transformer specs. Filtering happens after each item or key validation. Takes a spec to validate each item or key of a collection and filter predicate.

```ts
import { array, number, filter } from 'spectypes'

const check = array(filter(number, (x) => x > 1))

expect(check([1, 2, 3])).toEqual({
  tag: 'success',
  success: [2, 3]
})

expect(check([1, 2, null])).toEqual({
  tag: 'failure',
  failure: {
    value: [1, 2, null],
    errors: [{ issue: 'not a number', path: [2] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const _filter = (x) => x > 1

const check = (value) => {
  let err, result
  result = []

  if (!Array.isArray(value)) {
    ;(err = err || []).push({
      issue: 'not an array',
      path: []
    })
  } else {
    let filterindex = 0

    for (let index = 0; index < value.length; index++) {
      const value_index = value[index]

      if (typeof value_index !== 'number') {
        ;(err = err || []).push({
          issue: 'not a number',
          path: [index]
        })
      }

      if (!err && _filter(value_index)) {
        result[filterindex++] = value_index
      }
    }
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: result }
}
```

</details>

Type predicate will be taken into account if provided

```ts
import { array, string, filter } from 'spectypes'

const check = array(filter(string, (x): x is 'test' => x === 'test'))

expect(check(['hello', 'test', 'world'])).toEqual({
  tag: 'success',
  success: ['test'] // readonly 'test'[]
})
```

#### limit

Creates a spec with custom constraint. Takes a basis spec and a function to perform additinal validation.

```ts
import { number, limit } from 'spectypes'

const check = limit(number, (x) => x > 1)

expect(check(5)).toEqual({
  tag: 'success',
  success: 5
})

expect(check(-5)).toEqual({
  tag: 'failure',
  failure: {
    value: -5,
    errors: [{ issue: 'does not fit the limit', path: [] }]
  }
})

expect(check('5')).toEqual({
  tag: 'failure',
  failure: {
    value: '5',
    errors: [{ issue: 'not a number', path: [] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const _limit = (x) => x > 1

const check = (value) => {
  let err
  let error0

  if (typeof value !== 'number') {
    error0 = true
    ;(err = err || []).push({
      issue: 'not a number',
      path: []
    })
  }

  if (!error0 && !_limit(value)) {
    ;(err = err || []).push({
      issue: 'does not fit the limit',
      path: []
    })
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}
```

</details>

#### map

Creates a spec that transforms the result of successful validation. Takes basis spec and mapping function.

```ts
import { number, map } from 'spectypes'

const check = map(number, (x) => x + 1)

expect(check(10)).toEqual({
  tag: 'success',
  success: 11
})

expect(check(undefined)).toEqual({
  tag: 'failure',
  failure: {
    value: undefined,
    errors: [{ issue: 'not a number', path: [] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const _map = (x) => x + 1

const check = (value) => {
  let err, result

  if (typeof value !== 'number') {
    ;(err = err || []).push({
      issue: 'not a number',
      path: []
    })
  }

  if (!err) {
    result = _map(value)
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: result }
}
```

</details>

#### merge

Can combine `tuple` with `array` or `object` with `record` into single spec.

```ts
import { tuple, array, string, boolean, merge } from 'spectypes'

const check = merge(tuple(string, string), array(boolean))

expect(check(['hello', 'world', true])).toEqual({
  tag: 'success',
  success: ['hello', 'world', true]
})

expect(check(['hello', 'world', '!'])).toEqual({
  tag: 'failure',
  failure: {
    value: ['hello', 'world', '!'],
    errors: [{ issue: 'not a string', path: [2] }]
  }
})

expect(check(['hello'])).toEqual({
  tag: 'failure',
  failure: {
    value: ['hello'],
    errors: [{ issue: 'length is less than 2', path: [] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err

  if (!Array.isArray(value)) {
    ;(err = err || []).push({
      issue: 'not an array',
      path: []
    })
  } else if (value.length < 2) {
    ;(err = err || []).push({
      issue: 'length is less than ' + 2,
      path: []
    })
  } else {
    const value_$30_ = value[0]

    if (typeof value_$30_ !== 'string') {
      ;(err = err || []).push({
        issue: 'not a string',
        path: [0]
      })
    }

    const value_$31_ = value[1]

    if (typeof value_$31_ !== 'string') {
      ;(err = err || []).push({
        issue: 'not a string',
        path: [1]
      })
    }

    for (let index = 2; index < value.length; index++) {
      const value_index = value[index]

      if (typeof value_index !== 'boolean') {
        ;(err = err || []).push({
          issue: 'not a boolean',
          path: [index]
        })
      }
    }
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}
```

</details>

```ts
import { object, record, number, string, boolean, merge } from 'spectypes'

const check = merge(object({ x: number }), record(string, boolean))

expect(check({ x: 123, y: true })).toEqual({
  tag: 'success',
  success: { x: 123, y: true }
})

expect(check({ x: true, y: 123 })).toEqual({
  tag: 'failure',
  failure: {
    value: { x: true, y: 123 },
    errors: [
      { issue: 'not a number', path: ['x'] },
      { issue: 'not a boolean', path: ['y'] }
    ]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err

  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    ;(err = err || []).push({
      issue: 'not an object',
      path: []
    })
  } else {
    for (let i = 0; i < _spectypes.bannedKeys.length; i++) {
      const ban = _spectypes.bannedKeys[i]

      if (Object.prototype.hasOwnProperty.call(value, ban)) {
        ;(err = err || []).push({
          issue: "includes banned '" + ban + "' key",
          path: []
        })
      }
    }

    const value_x = value.x

    if (typeof value_x !== 'number') {
      ;(err = err || []).push({
        issue: 'not a number',
        path: ['x']
      })
    }

    for (const key in value) {
      if (!(key === 'x')) {
        const value_key = value[key]

        if (typeof value_key !== 'boolean') {
          ;(err = err || []).push({
            issue: 'not a boolean',
            path: [key]
          })
        }
      }
    }
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}
```

</details>

#### object

Creates an object validator spec. Validation will fail if validated object has a property set different from the one specified. Takes an object with specs to validate object properties. `literal(undefined)`, `nullish` and `unknown` are treated [specially](#special-cases) when used as a property validator inside `object`.

```ts
import { object, number, string, boolean } from 'spectypes'

const check = object({ x: number, y: string, z: boolean })

expect(check({ x: 1, y: '2', z: false })).toEqual({
  tag: 'success',
  success: { x: 1, y: '2', z: false }
})

expect(check({ x: 1, y: '2', z: false, xyz: [] })).toEqual({
  tag: 'failure',
  failure: {
    value: { x: 1, y: '2', z: false, xyz: [] },
    errors: [{ issue: 'excess key - xyz', path: [] }]
  }
})

expect(check({})).toEqual({
  tag: 'failure',
  failure: {
    value: {},
    errors: [
      { issue: 'not a number', path: ['x'] },
      { issue: 'not a string', path: ['y'] },
      { issue: 'not a boolean', path: ['z'] }
    ]
  }
})

expect(check([])).toEqual({
  tag: 'failure',
  failure: {
    value: [],
    errors: [{ issue: 'not an object', path: [] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err

  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    ;(err = err || []).push({
      issue: 'not an object',
      path: []
    })
  } else {
    const value_x = value.x

    if (typeof value_x !== 'number') {
      ;(err = err || []).push({
        issue: 'not a number',
        path: ['x']
      })
    }

    const value_y = value.y

    if (typeof value_y !== 'string') {
      ;(err = err || []).push({
        issue: 'not a string',
        path: ['y']
      })
    }

    const value_z = value.z

    if (typeof value_z !== 'boolean') {
      ;(err = err || []).push({
        issue: 'not a boolean',
        path: ['z']
      })
    }

    for (const key in value) {
      if (!(key === 'x' || key === 'y' || key === 'z')) {
        ;(err = err || []).push({
          issue: 'excess key - ' + key,
          path: []
        })
      }
    }
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}
```

</details>

#### optional

Creates an optional object property validator spec. Can be used only inside `object` and `struct` arguments. Will not produce any validation errors if property equals `undefined` or is not present in the validated object.

```ts
import { optional, struct, number } from 'spectypes'

const check = struct({ x: optional(number) })

expect(check({ x: 5 })).toEqual({
  tag: 'success',
  success: { x: 5 }
})

expect(check({ x: undefined })).toEqual({
  tag: 'success',
  success: { x: undefined }
})

expect(check({})).toEqual({
  tag: 'success',
  success: {}
})

expect(check({ x: 'x' })).toEqual({
  tag: 'failure',
  failure: {
    value: { x: 'x' },
    errors: [{ issue: 'not a number', path: ['x'] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err, result
  result = {}

  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    ;(err = err || []).push({
      issue: 'not an object',
      path: []
    })
  } else {
    const value_x = value.x

    if ('x' in value) {
      if (value_x !== undefined) {
        if (typeof value_x !== 'number') {
          ;(err = err || []).push({
            issue: 'not a number',
            path: ['x']
          })
        }
      }

      result.x = value_x
    }
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: result }
}
```

</details>

#### record

Creates a record validator spec. This validator is protected from prototype pollution and validation will fail if validated object contains properties that override `Object.proptotype` methods. This function has two signatures - one takes a spec to validate each key of a record and a spec to validate each item, another takes only item spec and treats all keys as strings. Key spec can be a `string`, `template`, string `literal` or `union` of these specs.

```ts
import { record, boolean } from 'spectypes'

const check = record(boolean)

expect(check({ foo: false, bar: true })).toEqual({
  tag: 'success',
  success: { foo: false, bar: true }
})

expect(check(true)).toEqual({
  tag: 'failure',
  failure: {
    value: true,
    errors: [{ issue: 'not an object', path: [] }]
  }
})

expect(check({ toString: true })).toEqual({
  tag: 'failure',
  failure: {
    value: { toString: true },
    errors: [{ issue: "includes banned 'toString' key", path: [] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err

  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    ;(err = err || []).push({
      issue: 'not an object',
      path: []
    })
  } else {
    for (let i = 0; i < _spectypes.bannedKeys.length; i++) {
      const ban = _spectypes.bannedKeys[i]

      if (Object.prototype.hasOwnProperty.call(value, ban)) {
        ;(err = err || []).push({
          issue: "includes banned '" + ban + "' key",
          path: []
        })
      }
    }

    for (const key in value) {
      const value_key = value[key]

      if (typeof value_key !== 'boolean') {
        ;(err = err || []).push({
          issue: 'not a boolean',
          path: [key]
        })
      }
    }
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}
```

</details>

#### struct

Creates an object transformer spec. All properties of validated object that are not present in passed param will be removed from the result of successful validation. Takes an object with specs to validate object properties. `literal(undefined)`, `nullish` and `unknown` are treated [specially](#special-cases) when used as a property validator inside `struct`.

```ts
import { struct, number, string, boolean } from 'spectypes'

const check = struct({ x: number, y: string, z: boolean })

expect(check({ x: 1, y: '2', z: false })).toEqual({
  tag: 'success',
  success: { x: 1, y: '2', z: false }
})

expect(check({ x: 1, y: '2', z: false, xyz: [] })).toEqual({
  tag: 'success',
  success: { x: 1, y: '2', z: false }
})

expect(check({})).toEqual({
  tag: 'failure',
  failure: {
    value: {},
    errors: [
      { issue: 'not a number', path: ['x'] },
      { issue: 'not a string', path: ['y'] },
      { issue: 'not a boolean', path: ['z'] }
    ]
  }
})

expect(check([])).toEqual({
  tag: 'failure',
  failure: {
    value: [],
    errors: [{ issue: 'not an object', path: [] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err, result
  result = {}

  if (typeof value !== 'object' || Array.isArray(value) || value === null) {
    ;(err = err || []).push({
      issue: 'not an object',
      path: []
    })
  } else {
    const value_x = value.x

    if (typeof value_x !== 'number') {
      ;(err = err || []).push({
        issue: 'not a number',
        path: ['x']
      })
    }

    result.x = value_x
    const value_y = value.y

    if (typeof value_y !== 'string') {
      ;(err = err || []).push({
        issue: 'not a string',
        path: ['y']
      })
    }

    result.y = value_y
    const value_z = value.z

    if (typeof value_z !== 'boolean') {
      ;(err = err || []).push({
        issue: 'not a boolean',
        path: ['z']
      })
    }

    result.z = value_z
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: result }
}
```

</details>

#### template

Creates a template string validator spec. Takes `number`, `string`, `boolean`, `literal` specs and their` union`s to validate parts of the validated string.

```ts
import { template, literal, number, string, boolean } from 'spectypes'

const check = template(literal('test'), string, number, boolean)

expect(check('test___123false')).toEqual({
  tag: 'success',
  success: 'test___123false'
})

expect(check('test___false')).toEqual({
  tag: 'failure',
  failure: {
    value: 'test___false',
    errors: [{ issue: 'template literal mismatch', path: [] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const _template = new RegExp(
  '^' +
    _spectypes.escape('test') +
    _spectypes.stringTest +
    _spectypes.numberTest +
    _spectypes.booleanTest +
    '$'
)

const check = (value) => {
  let err

  if (typeof value !== 'string') {
    ;(err = err || []).push({
      issue: 'not a string',
      path: []
    })
  } else if (!_template.test(value)) {
    ;(err = err || []).push({
      issue: 'template literal mismatch',
      path: []
    })
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}
```

</details>

#### tuple

Creates a tuple validator spec. Takes specs to validate tuple parts.

```ts
import { tuple, number, string, boolean } from 'spectypes'

const check = tuple(number, string, boolean)

expect(check([1, '2', false])).toEqual({
  tag: 'success',
  success: [1, '2', false]
})

expect(check([])).toEqual({
  tag: 'failure',
  failure: {
    value: [],
    errors: [{ issue: 'length is not 3', path: [] }]
  }
})

expect(check([1, '2', false, 1000])).toEqual({
  tag: 'failure',
  failure: {
    value: [1, '2', false, 1000],
    errors: [{ issue: 'length is not 3', path: [] }]
  }
})

expect(check(['1', '2', 'false'])).toEqual({
  tag: 'failure',
  failure: {
    value: ['1', '2', 'false'],
    errors: [
      { issue: 'not a number', path: [0] },
      { issue: 'not a boolean', path: [2] }
    ]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err

  if (!Array.isArray(value)) {
    ;(err = err || []).push({
      issue: 'not an array',
      path: []
    })
  } else if (value.length !== 3) {
    ;(err = err || []).push({
      issue: 'length is not ' + 3,
      path: []
    })
  } else {
    const value_$30_ = value[0]

    if (typeof value_$30_ !== 'number') {
      ;(err = err || []).push({
        issue: 'not a number',
        path: [0]
      })
    }

    const value_$31_ = value[1]

    if (typeof value_$31_ !== 'string') {
      ;(err = err || []).push({
        issue: 'not a string',
        path: [1]
      })
    }

    const value_$32_ = value[2]

    if (typeof value_$32_ !== 'boolean') {
      ;(err = err || []).push({
        issue: 'not a boolean',
        path: [2]
      })
    }
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}
```

</details>

#### union

Creates a union validator spec. Takes specs to validate union cases.

```ts
import { union, number, string, boolean } from 'spectypes'

const check = union(number, string, boolean)

expect(check('temp')).toEqual({
  tag: 'success',
  success: 'temp'
})

expect(check(true)).toEqual({
  tag: 'success',
  success: true
})

expect(check(null)).toEqual({
  tag: 'failure',
  failure: {
    value: null,
    errors: [
      { issue: 'union case #0 mismatch: not a number', path: [] },
      { issue: 'union case #1 mismatch: not a string', path: [] },
      { issue: 'union case #2 mismatch: not a boolean', path: [] }
    ]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const check = (value) => {
  let err
  let unmatched

  if (typeof value !== 'number') {
    unmatched = true
  }

  if (unmatched) {
    unmatched = false

    if (typeof value !== 'string') {
      unmatched = true
    }
  }

  if (unmatched) {
    unmatched = false

    if (typeof value !== 'boolean') {
      unmatched = true
    }
  }

  if (unmatched) {
    if (typeof value !== 'number') {
      ;(err = err || []).push({
        issue: 'union case #0 mismatch: not a number',
        path: []
      })
    }

    if (typeof value !== 'string') {
      ;(err = err || []).push({
        issue: 'union case #1 mismatch: not a string',
        path: []
      })
    }

    if (typeof value !== 'boolean') {
      ;(err = err || []).push({
        issue: 'union case #2 mismatch: not a boolean',
        path: []
      })
    }
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: value }
}
```

</details>

### Utilities

#### transformer

Spec that tells `babel` plugin to generate a wrapper for an external transformer spec. Any spec containing `struct`, `nullish`, `map`, `filter` and `transformer` specs will create and return new object on successful validation. Such spec has to be wrapped with `transformer` when used inside another spec.

```ts
import { array, transformer, map, number } from 'spectypes'

const negated = map(number, (x) => -x)
const check = array(transformer(negated))

// Incorrect usage !!!
// const negated = transformer(map(number, (x) => -x))
// const check = array(negated)

expect(check([1, 2, -3])).toEqual({
  tag: 'success',
  success: [-1, -2, 3]
})

expect(check([1, 2, 'abc'])).toEqual({
  tag: 'failure',
  failure: {
    value: [1, 2, 'abc'],
    errors: [{ issue: 'not a number', path: [2] }]
  }
})
```

<details>
  <summary>Transformed code</summary>

```js
import * as _spectypes from 'spectypes'

const _map = (x) => -x

const negated = (value) => {
  let err, result

  if (typeof value !== 'number') {
    ;(err = err || []).push({
      issue: 'not a number',
      path: []
    })
  }

  if (!err) {
    result = _map(value)
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: result }
}

const check = (value) => {
  let err, result
  result = []

  if (!Array.isArray(value)) {
    ;(err = err || []).push({
      issue: 'not an array',
      path: []
    })
  } else {
    for (let index = 0; index < value.length; index++) {
      let result_index
      const value_index = value[index]
      const ext_value_index0 = negated(value_index)

      if (ext_value_index0.tag === 'failure') {
        ;(err = err || []).push(
          ...ext_value_index0.failure.errors.map((fail) => ({
            issue: '' + fail.issue,
            path: [index, ...fail.path]
          }))
        )
      } else {
        result_index = ext_value_index0.success
      }

      result[index] = result_index
    }
  }

  return err
    ? { tag: 'failure', failure: { value, errors: err } }
    : { tag: 'success', success: result }
}
```

</details>

#### validator

#### lazy

Creates a spec to validate a value with recursive <b>type</b>. But <b>data</b> that recursively references itself is not supported.

#### writable

#### Spectype

## Misc

### Special cases

### Custom validators

### How is it tested?
