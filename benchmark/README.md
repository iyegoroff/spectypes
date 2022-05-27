
> spectypes-benchmark@2.0.9 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 4,591,894 ops/sec ±1.05% (88 runs sampled)</br>
spectypes@2.0.9 x 6,188,627 ops/sec ±1.12% (87 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 12,536,351 ops/sec ±0.79% (92 runs sampled)</br>
spectypes@2.0.9 x 15,840,566 ops/sec ±1.24% (87 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 174,884 ops/sec ±0.93% (89 runs sampled)</br>
spectypes@2.0.9 x 718,746 ops/sec ±0.68% (88 runs sampled)</br>
Fastest is <b>spectypes</b>

