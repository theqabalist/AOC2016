const input = require('./input');
const {histogram} = require('./helper');
const {pipe, split, transpose, map, join, head, invoker, sort, prop, sortBy} = require('ramda');

const histogramFrequency = pipe(
    split('\n'),
    transpose,
    map(join('')),
    map(sort((x, y) => x.localeCompare(y))),
    map(histogram),
    map(sortBy(prop(1)))
);

const firstOfFirstCompacted = pipe(
    map(head),
    map(head),
    join('')
);

const part1 = pipe(
    histogramFrequency,
    map(invoker(0, 'reverse')),
    firstOfFirstCompacted
);

const part2 = pipe(
    histogramFrequency,
    firstOfFirstCompacted
);

console.log(part1(input), part2(input));
