
> spectypes-benchmark@0.0.0 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,790,805 ops/sec ±0.12% (96 runs sampled)</br>
spectypes@2.0.5 x 6,801,222 ops/sec ±0.54% (95 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 13,870,602 ops/sec ±0.28% (94 runs sampled)</br>
spectypes@2.0.5 x 18,811,937 ops/sec ±1.33% (91 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 193,371 ops/sec ±2.43% (90 runs sampled)</br>
spectypes@2.0.5 x 763,217 ops/sec ±0.14% (99 runs sampled)</br>
Fastest is <b>spectypes</b>

