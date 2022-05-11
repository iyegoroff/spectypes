
> spectypes-benchmark@0.0.0 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,733,582 ops/sec ±0.36% (96 runs sampled)</br>
spectypes@1.0.6 x 6,748,390 ops/sec ±0.44% (94 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 14,001,988 ops/sec ±0.44% (95 runs sampled)</br>
spectypes@1.0.6 x 17,610,103 ops/sec ±0.78% (94 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 203,388 ops/sec ±2.03% (93 runs sampled)</br>
spectypes@1.0.6 x 762,725 ops/sec ±0.08% (97 runs sampled)</br>
Fastest is <b>spectypes</b>

