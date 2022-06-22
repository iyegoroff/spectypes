import { Chance } from 'chance'
import fc from 'fast-check'

export const chance = new Chance(Math.random)

export const terminalSpecs = [
  'string-literal',
  'numeric-literal',
  'null-literal',
  'boolean-literal',
  'undefined-literal',
  'number',
  'string',
  'boolean',
  'unknown',
  'nullish',
  'template',
  'limit-string'
] as const

export const allSpecs = [
  ...terminalSpecs,
  'optional',
  'tuple',
  'union',
  'transforming-union',
  'template-union',
  'literal-union',
  'array',
  'object',
  'struct',
  'record',
  'limit',
  'limit-number',
  'map-unknown-string',
  'map-string-string',
  'map-string-number',
  'tuple-array',
  'object-record',
  'writable',
  'filtered-array',
  'filtered-tuple-array',
  'filtered-record',
  'filtered-object-record'
] as const

export type Specs = ReadonlyArray<typeof allSpecs[number]>
export type Arb = fc.Arbitrary<unknown>
export type Convert = (val: unknown) => unknown

export const randomSpec = <T extends Record<Specs[number], number>>(specs: Specs, weights: T) => {
  try {
    return chance.weighted(
      [...specs],
      specs.map((spec) => weights[spec])
    )
  } catch (e) {
    console.log(specs)
    throw e
  }
}

export const identity = <T>(x: T) => x

export const skip = (fst: Specs, snd: Specs) =>
  [...new Set(fst)].filter((spec) => !snd.includes(spec))

export const intersect = (fst: Specs, snd: Specs) => {
  return [...new Set(fst)].filter((spec) => snd.includes(spec))
}

export const generateKeys = (max = 10) =>
  Array<number>(chance.integer({ min: 0, max }))
    .fill(0)
    .map((_, idx) => chance.string(idx % 2 === 0 ? { alpha: true } : undefined))
