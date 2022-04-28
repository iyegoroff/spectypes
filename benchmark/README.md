
> spectypes-benchmark@0.0.0 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,733,661 ops/sec ±0.32% (95 runs sampled)</br>
spectypes@1.0.3 x 6,664,579 ops/sec ±0.66% (95 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 13,475,549 ops/sec ±0.47% (95 runs sampled)</br>
spectypes@1.0.3 x 17,254,444 ops/sec ±0.75% (97 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 170,089 ops/sec ±2.17% (94 runs sampled)</br>
spectypes@1.0.3 x 754,036 ops/sec ±0.18% (96 runs sampled)</br>
Fastest is <b>spectypes</b>

