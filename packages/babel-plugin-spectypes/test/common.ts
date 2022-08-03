import fc from 'fast-check'

export type Path = ReadonlyArray<string | number>

export type Error = {
  readonly issue: string
  readonly path: Path
}

export const templateFloatConfig = { noDefaultInfinity: true, noNaN: true } as const

const prototypeMethods = Object.getOwnPropertyNames(Object.prototype)
export const skipPrototypeMethods = (value: unknown) =>
  !(typeof value === 'string' && value in prototypeMethods)
export const stringWithoutProtypeMethods = fc.string().filter(skipPrototypeMethods)
