import { Spec } from '../src'
import { Result } from 'ts-railway'

export type Path = ReadonlyArray<string | number>

export type Error = {
  readonly issue: string
  readonly path: Path
}

export type Check = (value: unknown) => Result<
  unknown,
  {
    readonly value: unknown
    readonly errors: readonly Error[]
  }
>

export type CreateGenerateCheck = (
  pref: string
) => <S extends Spec>(...specs: readonly [S, ...(readonly S[])]) => Check
