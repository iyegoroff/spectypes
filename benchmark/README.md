
> spectypes-benchmark@0.0.0 bench
> node ./build/index.js

## Benchmarking with benchmark.js
<b>object with constraints</b>:</br>
ajv@8.11.0 x 5,324,309 ops/sec ±1.12% (88 runs sampled)</br>
spectypes@2.0.7 x 7,715,294 ops/sec ±0.46% (98 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>nested object</b>:</br>
ajv@8.11.0 x 15,266,065 ops/sec ±0.83% (96 runs sampled)</br>
spectypes@2.0.7 x 17,781,885 ops/sec ±0.74% (87 runs sampled)</br>
Fastest is <b>spectypes</b>

<b>array of unions</b>:</br>
ajv@8.11.0 x 180,048 ops/sec ±1.44% (86 runs sampled)</br>
spectypes@2.0.7 x 846,183 ops/sec ±0.98% (95 runs sampled)</br>
Fastest is <b>spectypes</b>

