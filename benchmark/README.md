
> spectypes-benchmark@0.0.0 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,914,280 ops/sec ±0.98% (88 runs sampled)</br>
spectypes@1.0.0 x 7,162,299 ops/sec ±1.47% (87 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 14,562,189 ops/sec ±1.61% (91 runs sampled)</br>
spectypes@1.0.0 x 18,838,101 ops/sec ±1.62% (91 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 195,874 ops/sec ±3.90% (90 runs sampled)</br>
spectypes@1.0.0 x 862,645 ops/sec ±0.48% (96 runs sampled)</br>
Fastest is <b>spectypes</b>

