
> spectypes-benchmark@0.0.18 bench
> node ./build/index

object validation:</br>
ajv x 12,611,401 ops/sec ±0.24% (90 runs sampled)</br>
spectypes x 15,619,040 ops/sec ±0.29% (99 runs sampled)</br>
Fastest is spectypes</br>

array of unions validation:</br>
ajv x 206,868 ops/sec ±1.83% (91 runs sampled)</br>
spectypes x 712,379 ops/sec ±0.26% (97 runs sampled)</br>
Fastest is spectypes</br>
