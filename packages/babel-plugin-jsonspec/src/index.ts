import type babelCore from '@babel/core'
import { parseExpression } from '@babel/parser'
import { isDefined } from 'ts-is-defined'
import { parse } from './parse'
import { isSpecName, SpecName } from './spec'
import { transform, createAddLocal } from './transform'

type State = babelCore.PluginPass & {
  specNames?: Record<string, SpecName>
  jsonspecImport?: babelCore.types.Identifier
}

export default function plugin({ types: t }: typeof babelCore): babelCore.PluginObj<State> {
  return {
    name: 'jsonspec',
    visitor: {
      ImportDeclaration(path, state) {
        if (path.node.source.value === 'jsonspec') {
          state.specNames ??= {}

          for (const specifier of path.node.specifiers) {
            if (
              t.isImportSpecifier(specifier) &&
              t.isIdentifier(specifier.imported) &&
              isSpecName(specifier.imported.name)
            ) {
              state.specNames[specifier.local.name] = specifier.imported.name
            }
          }

          if (!isDefined(state.jsonspecImport)) {
            state.jsonspecImport = path.scope.generateUidIdentifier('js')
            path.node.specifiers = [t.importNamespaceSpecifier(state.jsonspecImport)]
          } else {
            path.remove()
          }
        }
      },

      VariableDeclaration(path, { specNames, jsonspecImport }) {
        if (!isDefined(specNames) || !isDefined(jsonspecImport)) {
          return
        }

        for (const decl of path.node.declarations) {
          const spec = t.isIdentifier(decl.init)
            ? decl.init.name
            : t.isCallExpression(decl.init) && t.isIdentifier(decl.init.callee)
            ? decl.init.callee.name
            : ''

          if (spec in specNames && isDefined(decl.init) && t.isIdentifier(decl.id)) {
            const parsed = parse(decl.init, { specNames })

            if (parsed.tag === 'success') {
              const transformed = transform(parsed.success, {
                jsonspecImport: jsonspecImport.name,

                addLocal: createAddLocal(new Set<string>()),

                declareGlobal: (name, init) => {
                  const id = path.scope.generateUidIdentifier(name)
                  path.insertBefore(
                    t.variableDeclaration('const', [
                      t.variableDeclarator(id, parseExpression(init))
                    ])
                  )
                  return id.name
                }
              })

              decl.init = parseExpression(transformed)
            } else {
              throw path.buildCodeFrameError(parsed.failure)
            }
          }
        }
      }
    }
  }
}
