
> spectypes-benchmark@0.0.18 bench
> node ./build/index.js

object validation:</br>
ajv x 10,324,479 ops/sec ±0.74% (88 runs sampled)</br>
spectypes x 12,453,264 ops/sec ±1.07% (91 runs sampled)</br>
Fastest is spectypes</br>

array of unions validation:</br>
ajv x 169,924 ops/sec ±2.37% (91 runs sampled)</br>
spectypes x 571,521 ops/sec ±0.98% (88 runs sampled)</br>
Fastest is spectypes</br>
