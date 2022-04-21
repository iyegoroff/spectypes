
> spectypes-benchmark@0.0.18 bench
> node ./build/index.js

object validation:</br>
ajv x 14,595,311 ops/sec ±0.27% (93 runs sampled)</br>
spectypes x 19,257,741 ops/sec ±0.43% (96 runs sampled)</br>
Fastest is spectypes</br>

array of unions validation:</br>
ajv x 239,971 ops/sec ±0.59% (90 runs sampled)</br>
spectypes x 834,736 ops/sec ±0.23% (96 runs sampled)</br>
Fastest is spectypes</br>
