export type Path = ReadonlyArray<string | number>

export type Error = {
  readonly issue: string
  readonly path: Path
}

export const templateFloatConfig = { noDefaultInfinity: true, noNaN: true } as const
