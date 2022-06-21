/* eslint-disable no-null/no-null */
import { inspect } from 'util'
import { parse } from '@babel/parser'
import { Scope } from '@babel/traverse'
import { types as t, traverse } from '@babel/core'
import { assertDefined } from 'ts-is-defined'
import { createAddLocal, transform } from 'spectypes-plugin-core'
import { CreateGenerateCheck, Check } from 'spectypes-plugin-core/test/common'

export const createGenerateCheck: CreateGenerateCheck =
  (prefix) =>
  (...specs) => {
    try {
      let check = prefix
      let scope: Scope | undefined

      traverse(parse(specs.map((_, idx) => `let check${idx};`).join('')), {
        enter(path) {
          if (t.isProgram(path.node)) {
            scope = path.scope
          }
        }
      })

      assertDefined(scope, 'no scope!')

      const defScope = scope
      const spectypesImport = defScope.generateUidIdentifier('js').name
      const declareGlobal = (name: string, init: string) => {
        const dec = defScope.generateUidIdentifier(name).name
        check += `const ${dec} = ${init};`
        return dec
      }

      const addLocal = createAddLocal(new Set<string>())
      const transformed = specs
        .map(
          (spec, idx) =>
            `const check${idx} = ${transform(spec, {
              spectypesImport,
              declareGlobal,
              addLocal
            })};`
        )
        .join('')

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, no-eval
      const fun: Check = eval(`${check} ${transformed} check0`)

      return fun
    } catch (e) {
      console.log(inspect(specs, { showHidden: false, depth: null, colors: true }))
      throw e
    }
  }
