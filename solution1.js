/*eslint no-confusing-arrow: off*/
const {map, pipe, split, head, tail, reduce, last, range, add, repeat, chain, equals} = require('ramda');
const input = 'R3, L5, R1, R2, L5, R2, R3, L2, L5, R5, L4, L3, R5, L1, R3, R4, R1, L3, R3, L2, L5, L2, R4, R5, R5, L4, L3, L3, R4, R4, R5, L5, L3, R2, R2, L3, L4, L5, R1, R3, L3, R2, L3, R5, L194, L2, L5, R2, R1, R1, L1, L5, L4, R4, R2, R2, L4, L1, R2, R53, R3, L5, R72, R2, L5, R3, L4, R187, L4, L5, L2, R1, R3, R5, L4, L4, R2, R5, L5, L4, L3, R5, L2, R1, R1, R4, L1, R2, L3, R5, L4, R2, L3, R1, L4, R4, L1, L2, R3, L1, L1, R4, R3, L4, R2, R5, L2, L3, L3, L1, R3, R5, R2, R3, R1, R2, L1, L4, L5, L2, R4, R5, L2, R4, R4, L3, R2, R1, L4, R3, L3, L4, L3, L1, R3, L2, R2, L4, L4, L5, R3, R5, R3, L2, R5, L2, L1, L5, L1, R2, R4, L5, R2, L4, L5, L4, L5, L2, L5, L4, R5, R3, R2, R2, L3, R3, L2, L5';
const headings = [[1, 0], [0, -1], [-1, 0], [0, 1]];
const bear = (heading, dir) => headings[(4 + headings.indexOf(heading) + dir) % 4];
const bearings = {R: 1, L: -1};
const scaleV2 = ([[a, b], x]) => [a * x, b * x];
const addV2 = ([a, b], [c, d]) => [a + c, b + d];

const instructions = pipe(
  split(', '),
  map(x => [head(x), parseInt(tail(x), 10)]),
  reduce((a, [bearing, magnitude]) => a.concat([[bear(head(last(a)), bearings[bearing]), magnitude]]), [[[0, 1], 0]])
);

const collapseTaxi = pipe(
  reduce(addV2, [0, 0]),
  map(Math.abs),
  reduce(add, 0)
);

const part1 = pipe(
  instructions,
  map(scaleV2),
  collapseTaxi
);

const emptyVectorSum = pipe(
  reduce(addV2, [0, 0]),
  equals([0, 0])
);

const zeroSubpath = path => {
    const space = path.length;
    return reduce((found, end) =>
      found || reduce((foundInner, start) => foundInner || (emptyVectorSum(path.slice(start, end + 1)) ? path.slice(0, start) : null), null, range(0, end + 1)),
    null, range(0, space));
};

const part2 = pipe(
  instructions,
  chain(([step, times]) => repeat([step, 1], times)),
  map(scaleV2),
  zeroSubpath,
  collapseTaxi
);

console.log(part1(input), part2(input));
