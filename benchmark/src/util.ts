import { ValidateFunction } from 'ajv'
import assert from 'assert'
import { Event, Suite } from 'benchmark'
import { Result } from 'ts-railway'

export const onCycle = (event: Event) => {
  console.log(`${String(event.target)}</br>`)
}

export const onComplete = ({ currentTarget }: { currentTarget: unknown }) => {
  if (currentTarget instanceof Suite) {
    console.log(
      `Fastest is <b>${String(currentTarget.filter('fastest').map('name')[0]).replace(
        /@.*$/,
        ''
      )}</b>`
    )
    console.log()
  }
}

export const onStart = (name: string) => () => {
  console.log(`<b>${name}</b>:</br>`)
}

export const ajvTest = (
  check: ValidateFunction,
  validData: unknown,
  invalidData: readonly unknown[]
) => {
  const message = 'ajv test failed'

  assert(check(validData), `valid ${message}`)
  invalidData.forEach((data, idx) => assert(!check(data), `invalid #${idx} ${message}`))
}

export const spectypesTest = (
  check: (val: unknown) => Result,
  validData: unknown,
  invalidData: readonly unknown[]
) => {
  const message = 'spectypes test failed'

  assert(check(validData).tag === 'success', `valid ${message}`)
  invalidData.forEach((data, idx) =>
    assert(check(data).tag === 'failure', `invalid #${idx} ${message}`)
  )
}
