export type Path = ReadonlyArray<string | number>

export type Error = {
  readonly issue: string
  readonly path: Path
}
