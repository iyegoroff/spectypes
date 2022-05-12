
> spectypes-benchmark@0.0.0 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,753,413 ops/sec ±0.08% (95 runs sampled)</br>
spectypes@2.0.2 x 6,783,685 ops/sec ±0.28% (89 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 13,898,149 ops/sec ±0.27% (97 runs sampled)</br>
spectypes@2.0.2 x 17,516,120 ops/sec ±0.29% (92 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 189,139 ops/sec ±2.23% (89 runs sampled)</br>
spectypes@2.0.2 x 764,953 ops/sec ±0.08% (96 runs sampled)</br>
Fastest is <b>spectypes</b>

