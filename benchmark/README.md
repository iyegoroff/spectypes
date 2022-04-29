
> spectypes-benchmark@0.0.0 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,236,196 ops/sec ±1.48% (82 runs sampled)</br>
spectypes@1.0.5 x 5,897,363 ops/sec ±1.14% (85 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 12,164,902 ops/sec ±1.27% (87 runs sampled)</br>
spectypes@1.0.5 x 16,319,755 ops/sec ±1.35% (87 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 132,719 ops/sec ±2.98% (76 runs sampled)</br>
spectypes@1.0.5 x 617,327 ops/sec ±1.54% (83 runs sampled)</br>
Fastest is <b>spectypes</b>

