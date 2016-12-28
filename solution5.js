const input = 'abbhdwsy';
const {Set: set, Range: range} = require('immutable');
const md5 = require('md5');
const {equals, compose, take, complement, gt, head, prop} = require('ramda');

function logger(x) {
    console.log(x);
    return x;
}

const interestingHashStream = function () {
    return range()
        .map(x => input + x)
        .map(md5)
        .filter(compose(equals('00000'), take(5)));
};

const part1 = interestingHashStream()
    .map(logger)
    .take(8)
    .map(prop(5))
    .join('');

const uniq = selector => {
    let cache = set();
    return function (item) {
        const cached = selector(item);
        if (cache.has(cached)) {
            return false;
        }
        cache = cache.add(cached);
        return true;
    };
};

const part2 = interestingHashStream()
    .map(x => [parseInt(x[5], 10), x[6]])
    .filter(compose(complement(isNaN), head))
    .filter(compose(gt(8), head))
    .filter(uniq(head))
    .map(logger)
    .take(8)
    .sortBy(head)
    .map(prop(1))
    .join('');

console.log(part1, part2);
