
> spectypes-benchmark@2.1.4 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,378,328 ops/sec ±1.38% (80 runs sampled)</br>
spectypes@2.1.4 x 6,336,369 ops/sec ±2.16% (76 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 11,869,576 ops/sec ±2.02% (74 runs sampled)</br>
spectypes@2.1.4 x 17,154,917 ops/sec ±1.47% (82 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 130,392 ops/sec ±3.31% (77 runs sampled)</br>
spectypes@2.1.4 x 624,022 ops/sec ±1.51% (82 runs sampled)</br>
Fastest is <b>spectypes</b>

