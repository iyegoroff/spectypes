
> spectypes-benchmark@0.0.18 bench
> node ./build/index.js

object validation:</br>
ajv x 12,595,207 ops/sec ±0.25% (96 runs sampled)</br>
spectypes x 16,228,840 ops/sec ±0.16% (94 runs sampled)</br>
Fastest is spectypes</br>

array of unions validation:</br>
ajv x 204,715 ops/sec ±1.96% (92 runs sampled)</br>
spectypes x 716,053 ops/sec ±0.71% (95 runs sampled)</br>
Fastest is spectypes</br>
