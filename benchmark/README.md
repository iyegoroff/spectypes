
> spectypes-benchmark@0.0.18 bench
> node ./build/index.js

object validation:</br>
ajv x 12,853,176 ops/sec ±0.28% (98 runs sampled)</br>
spectypes x 16,435,220 ops/sec ±1.17% (87 runs sampled)</br>
Fastest is spectypes</br>

array of unions validation:</br>
ajv x 178,872 ops/sec ±2.15% (82 runs sampled)</br>
spectypes x 713,715 ops/sec ±0.77% (94 runs sampled)</br>
Fastest is spectypes</br>
