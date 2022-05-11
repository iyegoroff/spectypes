
> spectypes-benchmark@0.0.0 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 3,890,270 ops/sec ±0.90% (88 runs sampled)</br>
spectypes@2.0.1 x 5,911,023 ops/sec ±1.02% (89 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 11,411,843 ops/sec ±0.89% (88 runs sampled)</br>
spectypes@2.0.1 x 15,684,199 ops/sec ±1.35% (86 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 145,193 ops/sec ±3.62% (80 runs sampled)</br>
spectypes@2.0.1 x 582,017 ops/sec ±1.29% (85 runs sampled)</br>
Fastest is <b>spectypes</b>

