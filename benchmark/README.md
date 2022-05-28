
> spectypes-benchmark@2.1.0 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,057,223 ops/sec ±0.95% (88 runs sampled)</br>
spectypes@2.1.0 x 5,825,633 ops/sec ±1.10% (88 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 12,053,383 ops/sec ±0.86% (91 runs sampled)</br>
spectypes@2.1.0 x 16,784,055 ops/sec ±0.83% (89 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 128,459 ops/sec ±1.87% (88 runs sampled)</br>
spectypes@2.1.0 x 586,309 ops/sec ±0.83% (91 runs sampled)</br>
Fastest is <b>spectypes</b>

