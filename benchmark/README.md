
> spectypes-benchmark@0.0.18 bench
> node ./build/index

object validation:</br>
ajv x 24,810,142 ops/sec ±1.13% (99 runs sampled)</br>
spectypes x 30,968,129 ops/sec ±1.37% (95 runs sampled)</br>
Fastest is spectypes</br>

array of unions validation:</br>
ajv x 502,828 ops/sec ±0.52% (92 runs sampled)</br>
spectypes x 1,423,476 ops/sec ±0.08% (98 runs sampled)</br>
Fastest is spectypes</br>
