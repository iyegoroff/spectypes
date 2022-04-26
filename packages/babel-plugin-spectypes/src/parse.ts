import { types as t } from '@babel/core'
import generate from '@babel/generator'
import { Result } from 'ts-railway'
import { pipeWith } from 'pipe-ts'
import { ArrowFunction, Identifier, isTemplateItemArray, Spec, SpecName } from './spec'
import { assertDefined } from 'ts-is-defined'

type ParseContext = {
  readonly specNames: Readonly<Record<string, SpecName>>
}

const pref = 'spectypes error: '

const fail = (x: string, y: string, suf = '') =>
  Result.failure(`${pref}'${x}' can't appear directly inside '${y}'${suf}`)

const invalidLoc = { line: NaN, column: NaN }

const locInfo = ({ loc }: { loc: t.Expression['loc'] }) => {
  const { start = invalidLoc, end = invalidLoc } = loc ?? {}

  return `starts at ln:${String(start.line)} col:${String(start.column + 1)}, ends at ln:${String(
    end.line
  )} col:${String(end.column + 1)}`
}

const identifier = (arg: Parameters<typeof t['isCallExpression']>[0]) =>
  t.isCallExpression(arg) && t.isIdentifier(arg.callee)
    ? arg.callee.name
    : t.isIdentifier(arg)
    ? arg.name
    : ''

const includes = (arr: readonly SpecName[], elem: string) =>
  (arr as readonly string[]).includes(elem)

const parseUnary = <S extends Spec>(
  name: S extends readonly [infer Name, Spec] ? (Name extends 'lazy' ? never : Name) : never,
  expression: t.CallExpression,
  rejects: readonly SpecName[],
  context: ParseContext
) => {
  const [arg0] = expression.arguments

  const argName = identifier(arg0)
  if (includes(rejects, argName)) {
    return fail(argName, name)
  }

  return t.isExpression(arg0)
    ? Result.map((spec) => [name, spec] as const, parseStep(arg0, [], context))
    : Result.failure(
        `${pref}first argument of the '${name}' spec that ${locInfo(
          expression
        )} should be an expression`
      )
}

const isFilter = (expression: t.Expression): expression is t.CallExpression =>
  t.isCallExpression(expression) &&
  t.isIdentifier(expression.callee) &&
  expression.callee.name === 'filter'

const parseArray = (
  expression: t.CallExpression,
  rejects: readonly SpecName[],
  context: ParseContext
) => {
  const [arg0] = expression.arguments

  if (!t.isExpression(arg0)) {
    return Result.failure(
      `${pref}first argument of the 'array' spec that ${locInfo(
        expression
      )} should be an expression`
    )
  }

  const argName = identifier(arg0)
  if (includes(rejects, argName)) {
    return fail(argName, 'array')
  }

  return isFilter(arg0)
    ? Result.map(
        ([, spec, filter]) => ['array', spec, filter] as const,
        parseFilter(arg0, [], context)
      )
    : Result.map((spec) => ['array', spec] as const, parseStep(arg0, [], context))
}

const parseMerge = (expression: t.CallExpression, context: ParseContext) => {
  const [arg0, arg1] = expression.arguments

  return t.isExpression(arg0)
    ? t.isExpression(arg1)
      ? pipeWith(
          Result.combine(parseStep(arg0, [], context), parseStep(arg1, [], context)),
          Result.flatMap(([spec0, spec1]) =>
            spec0[0] === 'tuple' && spec1[0] === 'array'
              ? Result.success(['tupleArray', spec0[1], spec1[1], spec1[2]] as const)
              : spec0[0] === 'object' && (spec1[0] === 'record' || spec1[0] === 'UNSAFE_record')
              ? Result.success([
                  `${spec1[0] === 'record' ? '' : 'UNSAFE_'}objectRecord`,
                  spec0[1],
                  spec1[1],
                  spec1[2],
                  spec1[3],
                  spec1[4]
                ] as const)
              : Result.failure(
                  `${pref}'merge' spec that ${locInfo(
                    expression
                  )} should contain 'tuple' & 'array' or 'object' & 'record' specs`
                )
          )
        )
      : Result.failure(
          `${pref}second argument of the 'merge' spec that ${locInfo(
            expression
          )} should be an expression`
        )
    : Result.failure(
        `${pref}first argument of the 'merge' spec that ${locInfo(
          expression
        )} should be an expression`
      )
}

function parseFunction(
  name: 'map' | 'limit',
  expression: t.CallExpression,
  rejects: readonly SpecName[],
  context: ParseContext
): Result<readonly [typeof name, Spec, Identifier | ArrowFunction], string>

function parseFunction(
  name: 'filter',
  expression: t.CallExpression,
  rejects: readonly SpecName[],
  context: ParseContext
): Result<readonly [typeof name, Spec, Identifier | ArrowFunction], string>

function parseFunction(
  name: 'map' | 'limit' | 'filter',
  expression: t.CallExpression,
  rejects: readonly SpecName[],
  context: ParseContext
): Result<readonly [typeof name, Spec, Identifier | ArrowFunction], string> {
  const [arg0, arg1] = expression.arguments

  if (!t.isExpression(arg0)) {
    return Result.failure(
      `${pref}first argument of the '${name}' spec that ${locInfo(
        expression
      )} should be an expression`
    )
  }

  const argName = identifier(arg0)
  if (includes(rejects, argName)) {
    return fail(argName, name)
  }

  const subSpec = parseStep(arg0, [], context)

  return t.isIdentifier(arg1)
    ? Result.map((spec) => [name, spec, ['identifier', arg1.name]] as const, subSpec)
    : t.isArrowFunctionExpression(arg1)
    ? Result.map((spec) => [name, spec, ['function', generate(arg1).code]] as const, subSpec)
    : Result.failure(
        `${pref}second argument of the '${name}' spec that ${locInfo(
          expression
        )} should be an identifier or an arrow function`
      )
}

const parseFilter = (
  expression: t.CallExpression,
  rejects: readonly SpecName[],
  context: ParseContext
) => parseFunction('filter', expression, rejects, context)

const parseUnaryArray = <S extends Spec>(
  name: S extends readonly [infer Name, readonly Spec[]]
    ? Name extends 'template'
      ? never
      : Name
    : never,
  expression: t.CallExpression,
  rejects: readonly SpecName[],
  context: ParseContext
) =>
  pipeWith(
    expression.arguments.map((arg, idx) => {
      const argName = identifier(arg)
      if (includes(rejects, argName)) {
        return fail(argName, name)
      }

      return t.isExpression(arg)
        ? parseStep(arg, [], context)
        : Result.failure(
            `${pref}the '${name}' spec argument #${idx} that ${locInfo(
              arg
            )} should be an expression`
          )
    }),
    (specs) => Result.combine(...specs),
    Result.map((specs) => [name, specs] as const)
  )

export const parseTemplate = (
  expression: t.CallExpression,
  rejects: readonly SpecName[],
  context: ParseContext
) =>
  pipeWith(
    expression.arguments.map((arg, idx) => {
      const argName = identifier(arg)
      if (includes(rejects, argName)) {
        return fail(argName, 'template')
      }

      return t.isExpression(arg)
        ? parseStep(arg, rejects, context)
        : Result.failure(
            `${pref}the 'template' spec argument #${idx} that ${locInfo(
              arg
            )} should be an expression`
          )
    }),
    (specs) => Result.combine(...specs),
    Result.flatMap((specs) =>
      isTemplateItemArray(specs)
        ? Result.success(['template', specs] as const)
        : Result.failure(
            `${pref}the 'template' spec that ${locInfo(expression)} has unsupported arguments`
          )
    )
  )

const parseUnaryObject = <S extends Spec>(
  name: S extends readonly [infer Name, Record<string, Spec>] ? Name : never,
  expression: t.CallExpression,
  rejects: readonly SpecName[],
  context: ParseContext
) => {
  const [arg0] = expression.arguments

  if (!t.isObjectExpression(arg0)) {
    return Result.failure(
      `${pref}first argument of the '${name}' spec that ${locInfo(
        expression
      )} should be an object expression`
    )
  }

  return arg0.properties.reduce<Result<readonly [typeof name, Record<string, Spec>], string>>(
    (acc, prop) =>
      Result.flatMap(([, specs]) => {
        if (!t.isObjectProperty(prop)) {
          return Result.failure(
            `${pref}the '${name}' spec first argument property that ${locInfo(
              prop
            )} should be an object property`
          )
        }

        const { key, value } = prop

        if (!t.isIdentifier(key)) {
          return Result.failure(
            `${pref}the '${name}' spec first argument property key that ${locInfo(
              key
            )} should be an identifier`
          )
        }

        if (!t.isExpression(value)) {
          return Result.failure(
            `${pref}the '${name}' spec first argument property value that ${locInfo(
              key
            )} should be an expression`
          )
        }

        const argName = identifier(value)
        if (includes(rejects, argName)) {
          return fail(argName, name)
        }

        return Result.map(
          (spec) => [name, { ...specs, [key.name]: spec }] as const,
          parseStep(value, [], context)
        )
      }, acc),
    Result.success([name, {}] as const)
  )
}

const parseLiteral = (expression: t.CallExpression) => {
  const [arg0] = expression.arguments

  return t.isIdentifier(arg0)
    ? Result.success(['literal', ['identifier', arg0.name]] as const)
    : t.isStringLiteral(arg0)
    ? Result.success(['literal', ['string', arg0.value]] as const)
    : t.isNullLiteral(arg0)
    ? Result.success(['literal', ['null']] as const)
    : t.isNumericLiteral(arg0)
    ? Result.success(['literal', ['numeric', arg0.value]] as const)
    : t.isBooleanLiteral(arg0)
    ? Result.success(['literal', ['boolean', arg0.value]] as const)
    : Result.failure(
        `${pref}first argument the 'literal' spec that ${locInfo(
          expression
        )} should be a string literal, a null literal, a numeric literal, a boolean literal or an identifier`
      )
}

const parseRecord = (
  name: 'record' | 'UNSAFE_record',
  expression: t.CallExpression,
  keyRejects: readonly SpecName[],
  itemRejects: readonly SpecName[],
  context: ParseContext
) => {
  const [arg0, arg1] = expression.arguments

  if (!t.isExpression(arg0)) {
    return Result.failure(
      `${pref}first argument of the '${name}' spec that ${locInfo(
        expression
      )} should be an expression`
    )
  }

  if (t.isExpression(arg1)) {
    const keyName = identifier(arg0)
    if (includes(keyRejects, keyName)) {
      return fail(keyName, name, ' key')
    }

    const itemName = identifier(arg1)
    if (includes(itemRejects, itemName)) {
      return fail(itemName, name, ' item')
    }
  } else {
    const itemName = identifier(arg0)
    if (includes(itemRejects, itemName)) {
      return fail(itemName, name, ' item')
    }
  }

  return t.isExpression(arg1)
    ? isFilter(arg0)
      ? isFilter(arg1)
        ? Result.map(
            ([[, keySpec, keyFilter], [, valSpec, valFilter]]) =>
              [name, keySpec, valSpec, keyFilter, valFilter] as const,
            Result.combine(parseFilter(arg0, keyRejects, context), parseFilter(arg1, [], context))
          )
        : Result.map(
            ([[, keySpec, keyFilter], valSpec]) => [name, keySpec, valSpec, keyFilter] as const,
            Result.combine(parseFilter(arg0, keyRejects, context), parseStep(arg1, [], context))
          )
      : isFilter(arg1)
      ? Result.map(
          ([keySpec, [, valSpec, valFilter]]) =>
            [name, keySpec, valSpec, undefined, valFilter] as const,
          Result.combine(parseStep(arg0, keyRejects, context), parseFilter(arg1, [], context))
        )
      : Result.map(
          (specs) => [name, ...specs] as const,
          Result.combine(parseStep(arg0, keyRejects, context), parseStep(arg1, [], context))
        )
    : isFilter(arg0)
    ? Result.map(
        ([, spec, filter]) => [name, ['string'], spec, undefined, filter] as const,
        parseFilter(arg0, [], context)
      )
    : Result.map((spec) => [name, ['string'], spec] as const, parseStep(arg0, [], context))
}

const parseLazy = (
  expression: t.CallExpression,
  rejects: readonly SpecName[],
  context: ParseContext
) => {
  const [arg0] = expression.arguments

  if (!t.isArrowFunctionExpression(arg0)) {
    return Result.failure(
      `${pref}first argument of the 'lazy' spec that ${locInfo(
        expression
      )} should be an arrow function`
    )
  }

  if (!t.isExpression(arg0.body)) {
    return Result.failure(
      `${pref}the body of the 'lazy' spec first argument that ${locInfo(
        arg0
      )} should be just a single expression`
    )
  }

  const argName = identifier(arg0.body)
  if (includes(rejects, argName)) {
    return fail(argName, 'lazy')
  }

  return Result.map((spec) => ['lazy', spec] as const, parseStep(arg0.body, [], context))
}

const parseStep = (
  expression: t.Expression,
  rejects: readonly SpecName[],
  context: ParseContext
): Result<Spec, string> => {
  const { specNames } = context

  if (t.isIdentifier(expression) && expression.name in specNames) {
    const specName = specNames[expression.name]

    switch (specName) {
      case 'boolean':
        return Result.success(['boolean'])

      case 'number':
        return Result.success(['number'])

      case 'string':
        return Result.success(['string'])

      case 'nullish':
        return Result.success(['nullish'])

      case 'unknown':
        return Result.success(['unknown'])

      default:
        return Result.failure(
          `${pref}identifier '${String(specName)}' that ${locInfo(
            expression
          )} should be a call expression`
        )
    }
  }

  if (
    t.isCallExpression(expression) &&
    t.isIdentifier(expression.callee) &&
    expression.callee.name in specNames
  ) {
    const specName = specNames[expression.callee.name]

    assertDefined(specName, `invalid spec name - ${expression.callee.name}`)

    switch (specName) {
      case 'literal':
        return parseLiteral(expression)

      case 'optional':
        return parseUnary(
          'optional',
          expression,
          [...rejects, 'optional', 'filter', 'lazy'],
          context
        )

      case 'array':
        return parseArray(expression, [...rejects, 'optional', 'lazy'], context)

      case 'tuple':
        return parseUnaryArray(
          'tuple',
          expression,
          [...rejects, 'optional', 'filter', 'lazy'],
          context
        )

      case 'union':
        return parseUnaryArray(
          'union',
          expression,
          [...rejects, 'optional', 'filter', 'unknown', 'union', 'lazy'],
          context
        )

      case 'object':
        return parseUnaryObject('object', expression, [...rejects, 'filter', 'lazy'], context)

      case 'struct':
        return parseUnaryObject('struct', expression, [...rejects, 'filter', 'lazy'], context)

      case 'record':
      case 'UNSAFE_record':
        return parseRecord(
          specName,
          expression,
          [
            ...rejects,
            'optional',
            'unknown',
            'nullish',
            'lazy',
            'array',
            'tuple',
            'object',
            'record',
            'UNSAFE_record',
            'merge',
            'struct',
            'number',
            'boolean'
          ],
          [...rejects, 'optional', 'lazy'],
          context
        )

      case 'lazy':
        return parseLazy(expression, [...rejects, 'filter', 'lazy'], context)

      case 'template':
        return parseTemplate(
          expression,
          [
            ...rejects,
            'optional',
            'filter',
            'unknown',
            'nullish',
            'lazy',
            'array',
            'tuple',
            'merge',
            'object',
            'record',
            'UNSAFE_record',
            'struct',
            'template',
            'limit',
            'map',
            'writable',
            'validator',
            'transformer'
          ],
          context
        )

      case 'map':
        return parseFunction('map', expression, [...rejects, 'optional', 'filter', 'lazy'], context)

      case 'limit':
        return parseFunction(
          'limit',
          expression,
          [...rejects, 'optional', 'filter', 'lazy'],
          context
        )

      case 'writable':
        return parseUnary('writable', expression, [...rejects, 'filter'], context)

      case 'validator':
        return parseUnary('validator', expression, [...rejects, 'filter'], context)

      case 'transformer':
        return parseUnary('transformer', expression, [...rejects, 'filter'], context)

      case 'merge':
        return parseMerge(expression, context)

      default:
        return Result.failure(
          `${pref}call expression '${String(specName)}' that ${locInfo(
            expression
          )} should be an identifier`
        )
    }
  }

  return t.isIdentifier(expression)
    ? Result.success(['external', ['identifier', expression.name]])
    : Result.failure(`${pref}unknown construct ${locInfo(expression)}`)
}

export const parse = (expression: t.Expression, context: ParseContext): Result<Spec, string> =>
  Result.flatMap(
    (spec) =>
      spec[0] === 'validator' || spec[0] === 'transformer'
        ? Result.failure(
            `${pref}'validator' or 'transformer' should be used only inside inside another spec ${locInfo(
              expression
            )}`
          )
        : Result.success(spec),
    parseStep(expression, [], context)
  )
