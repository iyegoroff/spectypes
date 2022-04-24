
> spectypes-benchmark@0.0.0 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 9,336,745 ops/sec ±11.04% (91 runs sampled)</br>
spectypes@0.0.46 x 11,651,971 ops/sec ±9.02% (83 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 25,899,894 ops/sec ±2.25% (97 runs sampled)</br>
spectypes@0.0.46 x 32,076,991 ops/sec ±1.74% (94 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 444,921 ops/sec ±1.88% (96 runs sampled)</br>
spectypes@0.0.46 x 1,088,409 ops/sec ±0.50% (100 runs sampled)</br>
Fastest is <b>spectypes</b>

