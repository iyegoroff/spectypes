
> spectypes-benchmark@0.0.18 bench
> node ./build/index.js

object validation:</br>
ajv x 11,642,722 ops/sec ±1.25% (86 runs sampled)</br>
spectypes x 14,785,821 ops/sec ±1.03% (88 runs sampled)</br>
Fastest is spectypes</br>

array of unions validation:</br>
ajv x 205,478 ops/sec ±2.23% (87 runs sampled)</br>
spectypes x 656,255 ops/sec ±1.01% (87 runs sampled)</br>
Fastest is spectypes</br>
