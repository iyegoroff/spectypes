
> spectypes-benchmark@2.1.9 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,498,140 ops/sec ±0.13% (98 runs sampled)</br>
spectypes@2.1.9 x 5,723,094 ops/sec ±0.50% (96 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 11,623,779 ops/sec ±0.23% (98 runs sampled)</br>
spectypes@2.1.9 x 14,681,761 ops/sec ±0.25% (97 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 196,028 ops/sec ±1.93% (92 runs sampled)</br>
spectypes@2.1.9 x 682,084 ops/sec ±0.04% (99 runs sampled)</br>
Fastest is <b>spectypes</b>

