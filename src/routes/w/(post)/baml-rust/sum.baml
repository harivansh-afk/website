
function sum(xs: int[]) -> int {
  let total = 0;
  let i = 0;
  while (i < xs.length()) {
    total += xs[i];
    i += 1;
  }
  total
}
