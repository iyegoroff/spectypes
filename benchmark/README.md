
> spectypes-benchmark@2.1.7 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 6,002,717 ops/sec ±0.37% (94 runs sampled)</br>
spectypes@2.1.7 x 7,956,742 ops/sec ±0.45% (93 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 17,080,707 ops/sec ±0.24% (96 runs sampled)</br>
spectypes@2.1.7 x 20,680,759 ops/sec ±0.30% (95 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 235,789 ops/sec ±2.20% (93 runs sampled)</br>
spectypes@2.1.7 x 729,274 ops/sec ±0.22% (97 runs sampled)</br>
Fastest is <b>spectypes</b>

