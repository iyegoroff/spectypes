type JsonspecError<X extends string, Y extends string, Suf extends string = ''> = {
  readonly [key in `jsonspec error: '${X}' can't appear directly inside '${Y}'${Suf}`]: never
}

type SuccessResult<Value> = {
  readonly tag: 'success'
  readonly success: Value
}

type FailureResult = {
  readonly tag: 'failure'
  readonly failure: {
    readonly value: unknown
    readonly errors: ReadonlyArray<{
      readonly issue: string
      readonly path: ReadonlyArray<number | string>
    }>
  }
}

type Result<Value> = FailureResult | SuccessResult<Value>

type SuccessOf<R extends Result<unknown>> = R extends SuccessResult<infer Success> ? Success : never

type SpecConfig<Tag extends readonly string[], Kind extends string> = {
  readonly tag: Tag
  readonly kind: Kind
}

type Spec<
  Tag extends readonly string[] = readonly string[],
  Kind extends string = string,
  Value = unknown
> = ((value: unknown) => Result<Value>) & { readonly config?: SpecConfig<Tag, Kind> }

type SpecSuccess<TSpec extends Spec> = SuccessOf<ReturnType<TSpec>>

type SpecTag<TSpec extends Spec> = Required<TSpec>['config'] extends SpecConfig<infer Tag, string>
  ? Tag
  : never

type SpecKind<TSpec extends Spec> = Required<TSpec>['config'] extends SpecConfig<
  readonly string[],
  infer Kind
>
  ? Kind
  : never

type SpecsTags<Specs extends readonly Spec[]> = Specs extends readonly [infer First, ...infer Rest]
  ? First extends Spec
    ? Rest extends readonly Spec[]
      ? readonly [...SpecTag<First>, ...SpecsTags<Rest>]
      : readonly []
    : readonly []
  : readonly []

type HasTag<TSpec extends Spec, Tags extends string> = {
  readonly [Index in keyof SpecTag<TSpec>]: Tags extends SpecTag<TSpec>[Index] ? true : false
}[number]

// source: https://github.com/badrap/valita/blob/v0.1.1/src/index.ts
type PrettyType<V> = Extract<{ [K in keyof V]: V[K] }, unknown>

type OmitByValue<Rec, Value> = Omit<
  Rec,
  { readonly [Key in keyof Rec]: Rec[Key] extends Value ? Key : never }[keyof Rec]
>

type ObjectValue<Specs extends Record<string, Spec>> = PrettyType<
  OmitByValue<
    {
      readonly [Key in keyof Specs]: Specs[Key] extends Spec
        ? HasTag<Specs[Key], 'optional'> extends true
          ? never
          : SpecSuccess<Specs[Key]>
        : never
    },
    never
  > &
    OmitByValue<
      {
        readonly [Key in keyof Specs]?: Specs[Key] extends Spec
          ? HasTag<Specs[Key], 'optional'> extends true
            ? SpecSuccess<Specs[Key]>
            : never
          : never
      },
      never | undefined
    >
>

// eslint-disable-next-line @typescript-eslint/ban-types
type LiteralBase = string | number | boolean | undefined | null

type InferKind<Specs extends readonly Spec[]> = Specs extends readonly [infer First, ...infer Rest]
  ? First extends Spec<readonly string[], 'transformer', unknown>
    ? 'transformer'
    : Rest extends readonly Spec[]
    ? InferKind<Rest>
    : 'validator'
  : 'validator'
