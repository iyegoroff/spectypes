
> spectypes-benchmark@0.0.18 bench
> node ./build/index.js

object validation:</br>
ajv x 12,152,322 ops/sec ±0.98% (86 runs sampled)</br>
spectypes x 14,374,583 ops/sec ±1.43% (89 runs sampled)</br>
Fastest is spectypes</br>

array of unions validation:</br>
ajv x 189,591 ops/sec ±2.13% (91 runs sampled)</br>
spectypes x 671,722 ops/sec ±1.06% (85 runs sampled)</br>
Fastest is spectypes</br>
