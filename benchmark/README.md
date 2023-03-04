
> spectypes-benchmark@2.1.8 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,932,849 ops/sec ±0.21% (98 runs sampled)</br>
spectypes@2.1.8 x 6,478,134 ops/sec ±0.67% (95 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 12,834,689 ops/sec ±0.44% (94 runs sampled)</br>
spectypes@2.1.8 x 15,314,689 ops/sec ±0.32% (95 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 205,201 ops/sec ±2.54% (92 runs sampled)</br>
spectypes@2.1.8 x 745,862 ops/sec ±0.19% (99 runs sampled)</br>
Fastest is <b>spectypes</b>

