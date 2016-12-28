const input = require('./input');
const {pipe, split, map, join, last, init, filter, sort, curry, compose, converge, add, find, prop, equals, take, over, sortBy, reduce, head, identity, lensIndex} = require('ramda');
const roomRegex = /^(\d+)\[(.+)\]$/;
const roomParse = s => {
    //eslint-disable-next-line no-unused-vars
    const [_, sector, checksum] = roomRegex.exec(s);
    return [parseInt(sector, 10), checksum];
};
const firstLens = lensIndex(0);
const alphabet = 'abcdefghijklmnopqrstuvwxyz';

const histogram = reduce((hist, e) => {
    const working = last(hist) || [null, null];
    const [context, amount] = working;
    const stem = context === e ? init(hist) : hist;
    const newWorking = context === e ? [context, amount + 1] : [e, 1];
    return stem.concat(Array.of(newWorking));
}, []);

const checksum = pipe(
    sortBy(identity),
    histogram,
    sort((x, y) => last(y) - last(x) || head(x).localeCompare(head(y))),
    take(5),
    map(head),
    join('')
);

const realRooms = pipe(
    split('\n'),
    filter(identity),
    map(split('-')),
    map(parts => [join('', init(parts))].concat(roomParse(last(parts)).concat(join('-', init(parts))))),
    map(over(firstLens, checksum)),
    filter(converge(equals, [head, prop(2)]))
);

const part1 = pipe(
    realRooms,
    map(prop(1)),
    reduce(add, 0)
);

//eslint-disable-next-line no-confusing-arrow
const translate = curry((shift, x) => x === '-' ? ' ' : alphabet[(alphabet.indexOf(x) + shift) % alphabet.length]);

const part2 = pipe(
    realRooms,
    map(x => [x[1], x[3]]),
    map(x => [head(x), map(translate(head(x)), last(x))]),
    map(over(lensIndex(1), join(''))),
    find(compose(x => x.toLowerCase().includes('north'), last))
);

console.log(part1(input), part2(input));
