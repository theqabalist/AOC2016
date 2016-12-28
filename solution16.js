/*eslint no-confusing-arrow: off */
const scaffold = require('./scaffold');
const {pipe, curry, take, reverse, map, equals, splitEvery} = require('ramda');
const translation = {0: '1', 1: '0'};

const expand1 = x => [x, map(x => translation[x], reverse(x)).join('')].join('0');

const expandTo = curry((size, input) =>
    input.length >= size ?
        take(size, input) :
        expandTo(size, expand1(input))
);

const checksum = input =>
    input.length % 2 === 1 ?
        input :
        checksum(map(x => equals(...x.split('')) ? '1' : '0', splitEvery(2, input)).join(''));

const part1 = pipe(
    expandTo(272),
    checksum
);

const part2 = pipe(
    expandTo(35651584),
    checksum
);

scaffold.value(part1, part2);
