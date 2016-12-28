//eslint-disable-next-line no-sync
const input = require('./input');

const {pipe, split, map, sort, flip, subtract, filter, splitEvery, transpose, concat, lt, __, prop, reduce, head, tail, identity} = require('ramda');

const numericalMatrix = pipe(
    split('\n'),
    filter(identity),
    map(split(/\s/)),
    map(filter(identity)),
    map(map(parseInt))
);

const validTriangles = pipe(
    map(sort(flip(subtract))),
    map(x => reduce(subtract, head(x), tail(x))),
    filter(lt(__, 0)),
    prop('length')
);

const part1 = pipe(
    numericalMatrix,
    validTriangles
);

const part2 = pipe(
    numericalMatrix,
    transpose,
    map(splitEvery(3)),
    reduce(concat, []),
    validTriangles
);

console.log(part1(input), part2(input));
