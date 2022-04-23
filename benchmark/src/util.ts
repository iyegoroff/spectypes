import { ValidateFunction } from 'ajv'
import { Event, Suite } from 'benchmark'
import { Result } from 'ts-railway'

export const onCycle = (event: Event) => {
  console.log(`${String(event.target)}</br>`)
}

export const onComplete = ({ currentTarget }: { currentTarget: unknown }) => {
  if (currentTarget instanceof Suite) {
    console.log(
      `Fastest is ${String(currentTarget.filter('fastest').map('name')[0]).replace(
        /@.*$/,
        ''
      )}</br></br>`
    )
  }
}

export const onStart = (name: string) => () => {
  console.log(`${name}:</br>`)
}

export const ajvCase = (check: ValidateFunction, data: unknown) => () => {
  const checked = check(data)
  if (!checked) {
    throw new Error(JSON.stringify(check.errors))
  }
}

export const spectypesCase = (check: (_: unknown) => Result, data: unknown) => () => {
  const checked = check(data)
  if (checked.tag === 'failure') {
    throw new Error(JSON.stringify(checked.failure))
  }
}
