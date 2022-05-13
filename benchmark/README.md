
> spectypes-benchmark@0.0.0 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 5,191,337 ops/sec ±1.30% (86 runs sampled)</br>
spectypes@2.0.4 x 7,383,857 ops/sec ±2.24% (94 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 14,786,284 ops/sec ±1.16% (90 runs sampled)</br>
spectypes@2.0.4 x 18,604,288 ops/sec ±1.50% (90 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 179,179 ops/sec ±0.74% (87 runs sampled)</br>
spectypes@2.0.4 x 756,457 ops/sec ±0.08% (93 runs sampled)</br>
Fastest is <b>spectypes</b>

