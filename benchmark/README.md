
> spectypes-benchmark@2.1.3 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,279,764 ops/sec ±0.82% (88 runs sampled)</br>
spectypes@2.1.3 x 6,151,334 ops/sec ±1.30% (86 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 12,317,500 ops/sec ±0.79% (87 runs sampled)</br>
spectypes@2.1.3 x 15,282,969 ops/sec ±0.74% (90 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 176,787 ops/sec ±2.60% (87 runs sampled)</br>
spectypes@2.1.3 x 683,437 ops/sec ±0.91% (82 runs sampled)</br>
Fastest is <b>spectypes</b>

