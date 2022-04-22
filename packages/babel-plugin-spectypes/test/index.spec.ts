import path from 'path'
import fs from 'fs'
import { transformFileSync } from '@babel/core'
import plugin from '../src'

function trim(str: string) {
  return str.replace(/^\s+|\s+$/, '')
}

describe('index', () => {
  const fixturesDir = path.join(__dirname, 'fixtures')

  const indexTest = (name: string) => {
    test(`${name.split('-').join(' ')} spec`, () => {
      const fixtureDir = path.join(fixturesDir, name)
      const expected = trim(fs.readFileSync(path.join(fixtureDir, 'expected.js')).toString())
      const actualPath = path.join(fixtureDir, 'actual.js')
      const actual = trim(
        transformFileSync(actualPath, { plugins: [plugin], sourceType: 'module' })?.code ?? ''
      )

      try {
        expect(actual).toEqual(expected)
      } catch (e) {
        console.log(name)
        console.log(actual)
        throw e
      }
    })
  }

  fs.readdirSync(fixturesDir)
    .filter((name) => !name.endsWith('-error'))
    .forEach(indexTest)

  test(`CodeFrameError exception`, () => {
    const fixtureDir = path.join(fixturesDir, 'array-error')
    const actualPath = path.join(fixtureDir, 'actual.js')
    expect(() =>
      transformFileSync(actualPath, { plugins: [plugin], sourceType: 'module' })
    ).toThrow(
      "first argument of the 'array' spec that starts at ln:3 col:15, ends at ln:3 col:31 should be an expression"
    )
  })
})
