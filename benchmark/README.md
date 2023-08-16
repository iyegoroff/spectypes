
> spectypes-benchmark@2.1.11 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 3,419,069 ops/sec ±1.09% (94 runs sampled)</br>
spectypes@2.1.11 x 4,271,385 ops/sec ±1.19% (89 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 8,827,259 ops/sec ±1.34% (88 runs sampled)</br>
spectypes@2.1.11 x 11,111,487 ops/sec ±0.77% (94 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 152,251 ops/sec ±2.16% (90 runs sampled)</br>
spectypes@2.1.11 x 514,716 ops/sec ±1.07% (90 runs sampled)</br>
Fastest is <b>spectypes</b>

