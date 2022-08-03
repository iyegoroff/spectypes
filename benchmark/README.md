
> spectypes-benchmark@2.1.5 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,213,745 ops/sec ±0.69% (85 runs sampled)</br>
spectypes@2.1.5 x 6,173,808 ops/sec ±1.09% (87 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 11,978,444 ops/sec ±0.80% (90 runs sampled)</br>
spectypes@2.1.5 x 15,334,949 ops/sec ±0.62% (91 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 174,032 ops/sec ±0.79% (88 runs sampled)</br>
spectypes@2.1.5 x 631,235 ops/sec ±0.75% (88 runs sampled)</br>
Fastest is <b>spectypes</b>

