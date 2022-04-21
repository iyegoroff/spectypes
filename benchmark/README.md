> spectypes-benchmark@0.0.18 bench
> node ./build/index.js

object validation:</br>
ajv x 25,042,427 ops/sec ±1.27% (92 runs sampled)</br>
spectypes x 32,752,117 ops/sec ±0.13% (100 runs sampled)</br>
Fastest is spectypes</br>

array of unions validation:</br>
ajv x 509,071 ops/sec ±0.48% (96 runs sampled)</br>
spectypes x 1,422,729 ops/sec ±0.15% (100 runs sampled)</br>
Fastest is spectypes</br>
