import { assertDefined, isDefined } from 'ts-is-defined'
import * as esc from 'js-name-escape'
import {
  ArraySpec,
  ArrowFunction,
  BooleanSpec,
  ExternalSpec,
  Identifier,
  isMutating,
  isTemplateItem,
  LimitSpec,
  LiteralSpec,
  MapSpec,
  NullishSpec,
  NumberSpec,
  ObjectRecordSpec,
  ObjectSpec,
  OptionalSpec,
  RecordSpec,
  Spec,
  StringSpec,
  StructSpec,
  TemplateSpec,
  TupleArraySpec,
  TupleSpec,
  UnionSpec,
  UnknownSpec
} from './spec'

type Key = readonly ['idx' | 'dot', string]

type Path = readonly Key[]

type LineLike = `${string}${';' | '{' | '}'}`

type TransformContext = {
  readonly jsonspecImport: string
  readonly addLocal: (name: string) => string
  readonly declareGlobal: (name: string, init: string) => string
}

type TransformConfig = {
  readonly path: Path
  readonly directValueName?: string
  readonly skipAssign?: boolean
  readonly skipResult?: boolean
  readonly unionErrorName?: string
  readonly limitErrorNames?: readonly string[]
  readonly skipDeclareResult?: boolean
  readonly error?: LineLike
  readonly issuePrefix?: string
  readonly resultPart?: LineLike
  readonly skipUnknownBody?: boolean
  readonly mutatingExternal?: boolean
}

const createFilter = (fn: Identifier | ArrowFunction | undefined, context: TransformContext) =>
  isDefined(fn)
    ? fn[0] === 'identifier'
      ? fn[1]
      : context.declareGlobal('filter', fn[1])
    : undefined

const isValidName = (str: string) => str !== '' && !/[^A-Za-z_]/.test(str)

const pathParts = (path: Path) => path.map(([, o]) => o)

const pathArray = (path: Path) => `[${path.map(([t, o]) => (t === 'dot' ? `'${o}'` : o)).join()}]`

const createName = (first: string) => (path: Path) =>
  esc.escape([first, ...pathParts(path)].join('_'))

const valueName = createName('value')

const keyName = createName('key')

const indexName = createName('index')

const resultName = createName('result')

const keyResultName = createName('keyresult')

const unmatchedName = createName('unmatched')

const unmatchedKeyName = createName('unmatchedkey')

const errorName = createName('error')

const filterName = (name: string) => `filter${name}`

const forIn = (key: string, val: string) => `for (const ${key} of Object.keys(${val}))`

const initResult = (path: Path, assign: string, skipResult: boolean | undefined) =>
  skipResult ?? false ? '' : `${resultName(path)} = ${assign};`

const declareResult = (path: Path, skipResult: boolean | undefined, pref = '') =>
  path.length === 0 || (skipResult ?? false) ? '' : `let ${pref}${resultName(path)};`

const accessValue = (key: Key, filteredArray = false) =>
  key[0] === 'dot'
    ? isValidName(key[1])
      ? `.${key[1]}`
      : `['${key[1]}']`
    : `[${filteredArray ? `${filterName(key[1])}++` : key[1]}]`

const assignValue = (path: Path, skipAssign: boolean | undefined) => {
  if (path.length === 0 || (skipAssign ?? false)) {
    return ''
  }

  const start = path.slice(0, path.length - 1)
  const last = path[path.length - 1]

  assertDefined(last, 'path is empty!')

  return `const ${valueName(path)} = ${valueName(start)}${accessValue(last)};`
}

const assignResultPart = (
  path: Path,
  key: Key | { readonly from: Key; readonly to: Key },
  isMutable: boolean,
  skipResult: boolean | undefined,
  {
    valFilter,
    keyFilter,
    filteredArray = false,
    error = 'err'
  }: {
    readonly valFilter?: string | undefined
    readonly keyFilter?: string | undefined
    readonly error?: string | undefined
    readonly filteredArray?: boolean | undefined
  } = {
    valFilter: undefined,
    keyFilter: undefined,
    filteredArray: undefined,
    error: undefined
  }
) => {
  const { from, to } = 'from' in key ? key : { from: key, to: key }
  const val = (isMutable ? resultName : valueName)([...path, from])

  return skipResult ?? false
    ? undefined
    : isDefined(valFilter) || isDefined(keyFilter)
    ? (`if (!${error}${isDefined(keyFilter) ? ` && ${keyFilter}(${from[1]})` : ''}${
        isDefined(valFilter) ? ` && ${valFilter}(${val})` : ''
      }) { ${resultName(path)}${accessValue(to, filteredArray)} = ${val}; }` as const)
    : (`${resultName(path)}${accessValue(to)} = ${val};` as const)
}

const limitErrors = (limitErrorNames: readonly string[] = []) =>
  limitErrorNames.reduce((acc, val) => `${acc}${val} = true;`, '')

const defaultError = (issue: string, path: Path, limitErrorNames: readonly string[] | undefined) =>
  `${limitErrors(limitErrorNames)}(err = err || []).push({ issue: ${issue}, path: ${pathArray(
    path
  )} });`

const terminalTransform = (
  spec: BooleanSpec | NumberSpec | StringSpec,
  {
    error,
    path,
    issuePrefix,
    skipAssign,
    directValueName,
    resultPart,
    limitErrorNames
  }: TransformConfig
) =>
  `${assignValue(path, isDefined(directValueName) || skipAssign)}if (typeof ${
    directValueName ?? valueName(path)
  } !== '${spec[0]}') {${
    error ?? defaultError(`'${issuePrefix ?? ''}not a ${spec[0]}'`, path, limitErrorNames)
  }}${resultPart ?? ''}`

const limitTransform = (spec: LimitSpec, config: TransformConfig, context: TransformContext) => {
  const { path, error, issuePrefix, unionErrorName, resultPart, directValueName, limitErrorNames } =
    config
  const { addLocal } = context
  const [, subSpec, limit] = spec
  const isUnknown = subSpec[0] === 'unknown'
  const mut = isMutating(subSpec)
  const check = `${
    limit[0] === 'identifier' ? limit[1] : context.declareGlobal('limit', limit[1])
  }(${directValueName ?? (mut ? resultName : valueName)(path)})`

  const limitError = addLocal(`${isDefined(directValueName) ? 'key' : ''}${errorName(path)}`)

  return `${isDefined(unionErrorName) || isUnknown ? '' : `let ${limitError};`}${transformStep(
    subSpec,
    { ...config, resultPart: undefined, limitErrorNames: [...(limitErrorNames ?? []), limitError] },
    context
  )}if (${isUnknown ? '' : `!${unionErrorName ?? limitError} && `}!${check}) {${
    error ?? defaultError(`'${issuePrefix ?? ''}does not fit the limit'`, path, limitErrorNames)
  }}${resultPart ?? ''}`
}

const mapTransform = (spec: MapSpec, config: TransformConfig, context: TransformContext) => {
  const { path, unionErrorName, resultPart, directValueName, skipDeclareResult, skipResult } =
    config
  const [, subSpec, map] = spec
  const mut = isMutating(subSpec)
  const transformName = map[0] === 'function' ? context.declareGlobal('map', map[1]) : ''
  const transform = `${map[0] === 'identifier' ? map[1] : transformName}(${
    directValueName ?? (mut ? resultName : valueName)(path)
  })`
  const pref = isDefined(directValueName) ? 'key' : ''

  return skipResult ?? false
    ? transformStep(subSpec, config, context)
    : `${declareResult(path, skipDeclareResult ?? mut, pref)}${transformStep(
        subSpec,
        { ...config, resultPart: undefined },
        context
      )}if (!${unionErrorName ?? 'err'}) {${pref}${resultName(path)} = ${transform};}${
        resultPart ?? ''
      }`
}

const literalTransform = (
  spec: LiteralSpec,
  {
    error,
    path,
    issuePrefix,
    skipAssign,
    resultPart,
    limitErrorNames,
    directValueName
  }: TransformConfig
) => {
  const lastIdx = path.length - 1
  const last = path[lastIdx]
  const prevPath = path.slice(0, lastIdx)
  const [, lit] = spec
  const checkMissing =
    lit[0] === 'identifier' && lit[1] === 'undefined' && isDefined(last)
      ? `if (!(${last[0] === 'idx' ? last[1] : `'${last[1]}'`} in ${valueName(prevPath)})) {${
          error ??
          defaultError(
            `'${issuePrefix ?? ''}missing key - ${
              last[0] === 'idx' ? `' + ${last[1]}` : `${last[1]}'`
            }`,
            prevPath,
            limitErrorNames
          )
        }}`
      : ''

  const [type, literal] =
    lit[0] === 'boolean'
      ? [' boolean', String(lit[1])]
      : lit[0] === 'identifier'
      ? ['', lit[1]]
      : lit[0] === 'null'
      ? ['', 'null']
      : lit[0] === 'numeric'
      ? [' number', lit[1]]
      : [' string', `'${lit[1]}'`]

  return `${assignValue(path, isDefined(directValueName) || skipAssign)}${checkMissing}if (${
    directValueName ?? valueName(path)
  } !== ${literal}) {${
    error ??
    defaultError(
      `"${issuePrefix ?? ''}not a '" + ${literal} + "'${type} literal"`,
      path,
      limitErrorNames
    )
  }}${resultPart ?? ''}`
}

const templateTransform = (
  spec: TemplateSpec,
  {
    error,
    path,
    issuePrefix,
    skipAssign,
    directValueName,
    resultPart,
    limitErrorNames
  }: TransformConfig,
  { jsonspecImport: js, declareGlobal }: TransformContext
) => {
  const templateIter = (val: TemplateSpec[1][0]): string =>
    val[0] === 'union'
      ? `'(?:' + ${val[1].filter(isTemplateItem).map(templateIter).join(` + '|' + `)} + ')'`
      : val[0] === 'boolean'
      ? `${js}.booleanTest`
      : val[0] === 'number'
      ? `${js}.numberTest`
      : val[0] === 'string'
      ? `${js}.stringTest`
      : val[1][0] === 'string'
      ? `${js}.escape('${val[1][1]}')`
      : val[1][0] === 'identifier'
      ? val[1][1] === 'undefined'
        ? val[1][1]
        : `${js}.escape(${val[1][1]})`
      : val[1][0] === 'null'
      ? 'null'
      : `'${String(val[1][1])}'`

  const templateName = declareGlobal(
    'template',
    spec[1].reduce((acc, val) => `${acc} + ${templateIter(val)}`, "new RegExp('^'") + " + '$')"
  )

  const val = directValueName ?? valueName(path)

  return `${assignValue(
    path,
    isDefined(directValueName) || skipAssign
  )}if (typeof ${val} !== 'string') {${
    error ?? defaultError(`'${issuePrefix ?? ''}not a string'`, path, limitErrorNames)
  }} else if (!${templateName}.test(${val})) {${
    error ?? defaultError(`'${issuePrefix ?? ''}template literal mismatch'`, path, limitErrorNames)
  }}${resultPart ?? ''}`
}

const nullishTransform = (
  _: NullishSpec,
  {
    error,
    path,
    issuePrefix,
    skipAssign,
    skipDeclareResult,
    resultPart,
    unionErrorName,
    limitErrorNames
  }: TransformConfig
) => {
  const val = valueName(path)

  return `${declareResult(path, skipDeclareResult)}${assignValue(
    path,
    skipAssign
  )}if (${val} !== null && ${val} !== undefined) {${
    error ?? defaultError(`"${issuePrefix ?? ''}not 'null' or 'undefined'"`, path, limitErrorNames)
  }}${isDefined(unionErrorName) ? ` else {${resultName(path)} = undefined;}` : ''}${
    resultPart ?? ''
  }`
}

const externalTransform = (
  spec: ExternalSpec,
  {
    path,
    skipResult,
    skipDeclareResult,
    skipAssign,
    error,
    issuePrefix,
    resultPart,
    mutatingExternal,
    limitErrorNames
  }: TransformConfig,
  { addLocal }: TransformContext
) => {
  const mut = mutatingExternal ?? isMutating(spec)
  const val = valueName(path)
  const ext = addLocal(`ext_${val}`)

  return `${mut ? declareResult(path, skipDeclareResult) : ''}${assignValue(
    path,
    skipAssign
  )}const ${ext} = ${spec[1][1]}(${val});if (${ext}.tag === 'failure') {${
    error ??
    `${limitErrors(
      limitErrorNames
    )}(err = err || []).push(...${ext}.failure.errors.map(fail => ({ issue: '${
      issuePrefix ?? ''
    }' + fail.issue, path: ${
      path.length > 0 ? `[${pathArray(path).replace(/\[(.*)\]/, '$1')}, ...fail.path]` : 'fail.path'
    } })))`
  }} ${skipResult ?? !mut ? '' : `else {${resultName(path)} = ${ext}.success;}`}${resultPart ?? ''}`
}

const optionalTransform = (
  [, subSpec]: OptionalSpec,
  config: TransformConfig,
  context: TransformContext
) => {
  const { path, skipAssign, skipDeclareResult, resultPart } = config
  const lastIdx = path.length - 1
  const last = path[lastIdx]
  const prevPath = path.slice(0, lastIdx)
  const checkKey = isDefined(last) && isDefined(resultPart)
  const transformStart = `if (${valueName(path)} !== undefined) {${transformStep(
    subSpec,
    { ...config, skipAssign: true, skipDeclareResult: true, resultPart: undefined },
    context
  )}`

  return `${isMutating(subSpec) ? declareResult(path, skipDeclareResult) : ''}${assignValue(
    path,
    skipAssign
  )}${
    checkKey
      ? `if (${last[0] === 'idx' ? last[1] : `'${last[1]}'`} in ${valueName(
          prevPath
        )}) { ${transformStart}}`
      : transformStart
  }${resultPart ?? ''}}`
}

const objectTransform = (
  spec: ObjectSpec,
  {
    error,
    path,
    issuePrefix,
    skipAssign,
    skipResult,
    skipDeclareResult,
    unionErrorName,
    resultPart,
    limitErrorNames
  }: TransformConfig,
  context: TransformContext
) => {
  const [, objectSpec] = spec
  const val = valueName(path)
  const mut = isMutating(spec)
  const key = keyName(path)
  const keys = Object.keys(objectSpec)

  return `${mut ? declareResult(path, skipDeclareResult) : ''}${assignValue(path, skipAssign)}${
    mut ? initResult(path, '{}', skipResult) : ''
  }if (typeof ${val} !== 'object' || Array.isArray(${val}) || ${val} === null) {${
    error ?? defaultError(`'${issuePrefix ?? ''}not an object'`, path, limitErrorNames)
  }} else {${Object.entries(objectSpec)
    .map(
      ([subKey, subSpec]) =>
        `${transformStep(
          subSpec,
          {
            error,
            path: [...path, ['dot', subKey]],
            issuePrefix,
            unionErrorName,
            limitErrorNames,
            resultPart: mut
              ? assignResultPart(path, ['dot', subKey], isMutating(subSpec), skipResult)
              : undefined
          },
          context
        )}`
    )
    .join('')}
  ${forIn(key, val)} { ${
    keys.length > 0 ? `if (!(${key} === '${keys.join(`' || ${key} === '`)}')) {` : ''
  }${error ?? defaultError(`'${issuePrefix ?? ''}excess key - ' + ${key}`, path, limitErrorNames)}${
    keys.length > 0 ? '}' : ''
  } } }${resultPart ?? ''}`
}

const recordTransform = (
  spec: RecordSpec,
  {
    error,
    path,
    issuePrefix,
    skipAssign,
    skipResult,
    skipDeclareResult,
    unionErrorName,
    resultPart,
    limitErrorNames
  }: TransformConfig,
  context: TransformContext
) => {
  const [, keySpec, valueSpec] = spec
  const { jsonspecImport: js } = context
  const val = valueName(path)
  const key = keyName(path)
  const mut = isMutating(spec)
  const noRecordCheck = keySpec[0] === 'string' && valueSpec[0] === 'unknown' && !mut
  const keyFilter = createFilter(spec[3], context)
  const valFilter = createFilter(spec[4], context)

  return `${mut ? declareResult(path, skipDeclareResult) : ''}${assignValue(path, skipAssign)}${
    mut ? initResult(path, '{}', skipResult) : ''
  }if (typeof ${val} !== 'object' || Array.isArray(${val}) || ${val} === null) {${
    error ?? defaultError(`'${issuePrefix ?? ''}not an object'`, path, limitErrorNames)
  }} else {for (let i = 0; i < ${js}.bannedKeys.length; i++){const ban = ${js}.bannedKeys[i];
  if (Object.prototype.hasOwnProperty.call(${val},ban)) {${
    error ??
    defaultError(`"${issuePrefix ?? ''}includes banned '" + ban + "' key"`, path, limitErrorNames)
  }}}${
    noRecordCheck
      ? ''
      : `${forIn(key, val)} {${
          keySpec[0] === 'string'
            ? ''
            : transformStep(
                keySpec,
                {
                  error,
                  path: [...path, ['idx', key]],
                  issuePrefix: `${issuePrefix ?? ''}key issue: `,
                  unionErrorName,
                  directValueName: key,
                  limitErrorNames
                },
                context
              )
        } ${transformStep(
          valueSpec,
          {
            error,
            path: [...path, ['idx', key]],
            issuePrefix,
            unionErrorName,
            skipUnknownBody: true,
            limitErrorNames,
            resultPart: mut
              ? assignResultPart(
                  path,
                  {
                    from: ['idx', key],
                    to: isMutating(keySpec)
                      ? ['idx', keyResultName([...path, ['idx', key]])]
                      : ['idx', key]
                  },
                  isMutating(valueSpec),
                  skipResult,
                  { valFilter, keyFilter, error: unionErrorName }
                )
              : undefined
          },
          context
        )}}`
  }}${resultPart ?? ''}`
}

const objectRecordTransform = (
  spec: ObjectRecordSpec,
  {
    error,
    path,
    issuePrefix,
    skipAssign,
    skipResult,
    skipDeclareResult,
    unionErrorName,
    resultPart,
    limitErrorNames
  }: TransformConfig,
  context: TransformContext
) => {
  const [, objectSpec, keySpec, valueSpec] = spec
  const { jsonspecImport: js } = context
  const val = valueName(path)
  const key = keyName(path)
  const mut = isMutating(spec)
  const keys = Object.keys(objectSpec)
  const noRecordCheck = keySpec[0] === 'string' && valueSpec[0] === 'unknown' && !mut
  const keyFilter = createFilter(spec[4], context)
  const valFilter = createFilter(spec[5], context)

  return `${mut ? declareResult(path, skipDeclareResult) : ''}${assignValue(path, skipAssign)}${
    mut ? initResult(path, '{}', skipResult) : ''
  }if (typeof ${val} !== 'object' || Array.isArray(${val}) || ${val} === null) {${
    error ?? defaultError(`'${issuePrefix ?? ''}not an object'`, path, limitErrorNames)
  }} else {for (let i = 0; i < ${js}.bannedKeys.length; i++){const ban = ${js}.bannedKeys[i];
  if (Object.prototype.hasOwnProperty.call(${val},ban)) {${
    error ??
    defaultError(`"${issuePrefix ?? ''}includes banned '" + ban + "' key"`, path, limitErrorNames)
  }}}${Object.entries(objectSpec)
    .map(
      ([subKey, subSpec]) =>
        `${transformStep(
          subSpec,
          {
            error,
            path: [...path, ['dot', subKey]],
            issuePrefix,
            unionErrorName,
            limitErrorNames,
            resultPart: mut
              ? assignResultPart(path, ['dot', subKey], isMutating(subSpec), skipResult)
              : undefined
          },
          context
        )}`
    )
    .join('')}${
    noRecordCheck
      ? ''
      : `${forIn(key, val)} {${
          keys.length > 0 ? `if (!(${key} === '${keys.join(`' || ${key} === '`)}')) {` : ''
        }${
          keySpec[0] === 'string'
            ? ''
            : transformStep(
                keySpec,
                {
                  error,
                  path: [...path, ['idx', key]],
                  issuePrefix: `${issuePrefix ?? ''}key issue: `,
                  unionErrorName,
                  directValueName: key,
                  limitErrorNames
                },
                context
              )
        } ${transformStep(
          valueSpec,
          {
            error,
            path: [...path, ['idx', key]],
            issuePrefix,
            unionErrorName,
            skipUnknownBody: true,
            limitErrorNames,
            resultPart: mut
              ? assignResultPart(
                  path,
                  {
                    from: ['idx', key],
                    to: isMutating(keySpec)
                      ? ['idx', keyResultName([...path, ['idx', key]])]
                      : ['idx', key]
                  },
                  isMutating(valueSpec),
                  skipResult,
                  { valFilter, keyFilter, error: unionErrorName }
                )
              : undefined
          },
          context
        )}${keys.length > 0 ? '}' : ''}}`
  }}${resultPart ?? ''}`
}

const structTransform = (
  [, structSpec]: StructSpec,
  {
    error,
    path,
    issuePrefix,
    skipAssign,
    skipResult,
    skipDeclareResult,
    unionErrorName,
    resultPart,
    limitErrorNames
  }: TransformConfig,
  context: TransformContext
) => {
  const val = valueName(path)

  return `${declareResult(path, skipDeclareResult)}${assignValue(path, skipAssign)}${initResult(
    path,
    '{}',
    skipResult
  )}if (typeof ${val} !== 'object' || Array.isArray(${val}) || ${val} === null) {${
    error ?? defaultError(`'${issuePrefix ?? ''}not an object'`, path, limitErrorNames)
  }} else {${Object.entries(structSpec)
    .map(
      ([key, subSpec]) =>
        `${transformStep(
          subSpec,
          {
            error,
            path: [...path, ['dot', key]],
            issuePrefix,
            limitErrorNames,
            unionErrorName,
            resultPart: assignResultPart(path, ['dot', key], isMutating(subSpec), skipResult)
          },
          context
        )}`
    )
    .join('')} }${resultPart ?? ''}`
}

const tupleTransform = (
  spec: TupleSpec,
  {
    error,
    path,
    issuePrefix,
    skipAssign,
    skipResult,
    skipDeclareResult,
    unionErrorName,
    resultPart,
    limitErrorNames
  }: TransformConfig,
  context: TransformContext
) => {
  const [, subSpecs] = spec
  const val = valueName(path)
  const mut = isMutating(spec)

  return `${mut ? declareResult(path, skipDeclareResult) : ''}${assignValue(path, skipAssign)}${
    mut ? initResult(path, '[]', skipResult) : ''
  }if (!Array.isArray(${val})) {${
    error ?? defaultError(`'${issuePrefix ?? ''}not an array'`, path, limitErrorNames)
  }} else if (${val}.length !== ${subSpecs.length}) {${
    error ??
    defaultError(`'${issuePrefix ?? ''}length is not ' + ${subSpecs.length}`, path, limitErrorNames)
  }} else {${subSpecs
    .map((subSpec, idx) =>
      transformStep(
        subSpec,
        {
          error,
          path: [...path, ['idx', `${idx}`]],
          issuePrefix,
          limitErrorNames,
          unionErrorName,
          resultPart: mut
            ? assignResultPart(path, ['idx', `${idx}`], isMutating(subSpec), skipResult)
            : undefined
        },
        context
      )
    )
    .join('')}
  }${resultPart ?? ''}`
}

const tupleArrayTransform = (
  spec: TupleArraySpec,
  {
    error,
    path,
    issuePrefix,
    skipAssign,
    skipResult,
    skipDeclareResult,
    unionErrorName,
    resultPart,
    limitErrorNames
  }: TransformConfig,
  context: TransformContext
) => {
  const val = valueName(path)
  const mut = isMutating(spec)
  const tupleLength = spec[1].length
  const valFilter = createFilter(spec[3], context)

  const checkItems = spec[2][0] !== 'unknown' || mut

  const transform = (subSpec: Spec, idx: string | number, isTuple: boolean) =>
    transformStep(
      subSpec,
      {
        error,
        path: [...path, ['idx', `${idx}`]],
        issuePrefix,
        limitErrorNames,
        skipUnknownBody: !isTuple,
        unionErrorName,
        resultPart: mut
          ? assignResultPart(
              path,
              ['idx', `${idx}`],
              isMutating(subSpec),
              skipResult,
              isTuple
                ? undefined
                : {
                    valFilter,
                    filteredArray: true,
                    error: unionErrorName
                  }
            )
          : undefined
      },
      context
    )

  const idx = indexName(path)

  return `${mut ? declareResult(path, skipDeclareResult) : ''}${assignValue(path, skipAssign)}${
    mut ? initResult(path, '[]', skipResult) : ''
  }if (!Array.isArray(${val})) {${
    error ?? defaultError(`'${issuePrefix ?? ''}not an array'`, path, limitErrorNames)
  }} else if (${val}.length < ${tupleLength}) {${
    error ??
    defaultError(
      `'${issuePrefix ?? ''}length is less than ' + ${tupleLength}`,
      path,
      limitErrorNames
    )
  }} else {${spec[1].map((v, i) => transform(v, i, true)).join('')} ${
    checkItems
      ? `${
          isDefined(valFilter) ? `let ${filterName(idx)} = ${tupleLength};` : ''
        }for (let ${idx} = ${tupleLength}; ${idx} < ${val}.length; ${idx}++) {${transform(
          spec[2],
          idx,
          false
        )}}`
      : ''
  }}${resultPart ?? ''}`
}

const arrayTransform = (
  spec: ArraySpec,
  {
    error,
    path,
    issuePrefix,
    skipAssign,
    skipResult,
    skipDeclareResult,
    unionErrorName,
    resultPart,
    limitErrorNames
  }: TransformConfig,
  context: TransformContext
) => {
  const [, subSpec] = spec
  const val = valueName(path)
  const mut = isMutating(spec)
  const idx = indexName(path)
  const valFilter = createFilter(spec[2], context)

  const checkItems = subSpec[0] !== 'unknown' || mut

  return `${mut ? declareResult(path, skipDeclareResult) : ''}${assignValue(path, skipAssign)}${
    mut ? initResult(path, '[]', skipResult) : ''
  }if (!Array.isArray(${val})) {${
    error ?? defaultError(`'${issuePrefix ?? ''}not an array'`, path, limitErrorNames)
  }}${
    checkItems
      ? ` else {${
          isDefined(valFilter) ? `let ${filterName(idx)} = 0;` : ''
        }for (let ${idx} = 0; ${idx} < ${val}.length; ${idx}++) {${transformStep(
          subSpec,
          {
            error,
            path: [...path, ['idx', idx]],
            issuePrefix,
            unionErrorName,
            limitErrorNames,
            skipUnknownBody: true,
            resultPart: mut
              ? assignResultPart(path, ['idx', idx], isMutating(subSpec), skipResult, {
                  valFilter,
                  filteredArray: true,
                  error: unionErrorName
                })
              : undefined
          },
          context
        )}}}`
      : ''
  }${resultPart ?? ''}`
}

const unknownTransform = (
  _: UnknownSpec,
  {
    path,
    skipAssign,
    error,
    issuePrefix,
    resultPart,
    skipUnknownBody,
    limitErrorNames
  }: TransformConfig
) => {
  const lastIdx = path.length - 1
  const last = path[lastIdx]
  const prevPath = path.slice(0, lastIdx)

  return `${assignValue(path, skipAssign)}${
    isDefined(last) && !(skipUnknownBody ?? false)
      ? `if (!(${last[0] === 'idx' ? last[1] : `'${last[1]}'`} in ${valueName(prevPath)})) {${
          error ??
          defaultError(
            `'${issuePrefix ?? ''}missing key - ${
              last[0] === 'idx' ? `' + ${last[1]}` : `${last[1]}'`
            }`,
            prevPath,
            limitErrorNames
          )
        }}`
      : ''
  }${resultPart ?? ''}`
}

const unionTransform = (
  spec: UnionSpec,
  {
    path,
    skipDeclareResult,
    issuePrefix,
    unionErrorName,
    resultPart,
    limitErrorNames,
    directValueName
  }: TransformConfig,
  context: TransformContext
) => {
  const [, subSpecs] = spec
  const mut = isMutating(spec)
  const isDirect = isDefined(directValueName)
  const unmatched = (isDirect ? unmatchedKeyName : unmatchedName)(path)
  const pref = isDirect ? 'key' : ''

  return `${
    mut ? declareResult(path, skipDeclareResult, pref) : ''
  } ${`let ${unmatched};`}${subSpecs
    .map(
      (subSpec, idx) =>
        `${idx === 0 ? '' : `if (${unmatched}) { ${unmatched} = false;`}${transformStep(
          subSpec,
          {
            path,
            unionErrorName: unmatched,
            directValueName,
            skipDeclareResult: true,
            skipAssign: idx !== 0,
            error: `${unmatched} = true;`
          },
          context
        )}${
          mut && !isMutating(subSpec)
            ? `if (!${unmatched}) {${pref}${resultName(path)} = ${
                directValueName ?? valueName(path)
              }}`
            : ''
        }${idx === 0 ? '' : '}'}`
    )
    .join('')}${
    isDefined(unionErrorName)
      ? `if (${unmatched}) {${unionErrorName} = true;}`
      : `if (${unmatched}) {${subSpecs
          .map((subSpec, idx) =>
            transformStep(
              subSpec,
              {
                path,
                skipDeclareResult: true,
                skipAssign: true,
                skipResult: true,
                limitErrorNames,
                directValueName,
                issuePrefix: `${issuePrefix ?? ''}union case #${idx} mismatch: `
              },
              context
            )
          )
          .join('')}}`
  }${resultPart ?? ''}`
}

const transformStep = (spec: Spec, config: TransformConfig, context: TransformContext): string => {
  switch (spec[0]) {
    case 'boolean':
      return terminalTransform(spec, config)

    case 'number':
      return terminalTransform(spec, config)

    case 'string':
      return terminalTransform(spec, config)

    case 'nullish':
      return nullishTransform(spec, config)

    case 'unknown':
      return unknownTransform(spec, config)

    case 'object':
      return objectTransform(spec, config, context)

    case 'struct':
      return structTransform(spec, config, context)

    case 'tuple':
      return tupleTransform(spec, config, context)

    case 'union':
      return unionTransform(spec, config, context)

    case 'optional':
      return optionalTransform(spec, config, context)

    case 'lazy':
      return transformStep(spec[1], config, context)

    case 'external':
      return externalTransform(spec, config, context)

    case 'objectRecord':
      return objectRecordTransform(spec, config, context)

    case 'record':
      return recordTransform(spec, config, context)

    case 'array':
      return arrayTransform(spec, config, context)

    case 'tupleArray':
      return tupleArrayTransform(spec, config, context)

    case 'literal':
      return literalTransform(spec, config)

    case 'limit':
      return limitTransform(spec, config, context)

    case 'map':
      return mapTransform(spec, config, context)

    case 'template':
      return templateTransform(spec, config, context)

    case 'writable':
      return transformStep(spec[1], config, context)

    case 'validator':
      return transformStep(spec[1], { ...config, mutatingExternal: false }, context)

    case 'transformer':
      return transformStep(spec[1], { ...config, mutatingExternal: true }, context)
  }
}

export const createAddLocal = (locals: Set<string>) => (name: string) => {
  let suffix = 0
  while (locals.has(`${name}${suffix}`)) {
    suffix += 1
  }
  const localName = `${name}${suffix}`
  locals.add(localName)

  return localName
}

export const transform = (spec: Spec, context: TransformContext): string =>
  `(value) => { let err${isMutating(spec) ? ', result' : ''}; ${transformStep(
    spec,
    { path: [] },
    context
  )}
return err ? { tag: 'failure', failure: { value, errors: err } } : { tag: 'success', success: ${
    isMutating(spec) ? 'result' : 'value'
  } }; }`
