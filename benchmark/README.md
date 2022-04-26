
> spectypes-benchmark@0.0.0 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,116,609 ops/sec ±0.83% (87 runs sampled)</br>
spectypes@0.0.48 x 6,011,389 ops/sec ±0.85% (88 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 12,664,912 ops/sec ±0.70% (90 runs sampled)</br>
spectypes@0.0.48 x 16,961,975 ops/sec ±1.14% (89 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 135,610 ops/sec ±2.54% (89 runs sampled)</br>
spectypes@0.0.48 x 600,167 ops/sec ±0.74% (89 runs sampled)</br>
Fastest is <b>spectypes</b>

