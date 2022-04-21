
> spectypes-benchmark@0.0.18 bench
> node ./build/index.js

object validation:</br>
ajv x 12,450,770 ops/sec ±0.32% (91 runs sampled)</br>
spectypes x 15,382,363 ops/sec ±0.36% (91 runs sampled)</br>
Fastest is spectypes</br>

array of unions validation:</br>
ajv x 172,203 ops/sec ±2.08% (83 runs sampled)</br>
spectypes x 708,964 ops/sec ±0.15% (98 runs sampled)</br>
Fastest is spectypes</br>
