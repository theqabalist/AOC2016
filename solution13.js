//http://adventofcode.com/2016/day/13
/*eslint no-confusing-arrow: off */
const input = parseInt(require('./input'), 10);
const {catcat} = require('./helper');
const {pipe, filter, head, identity, reduce, tail, length, repeat, uniq, chain, map, sortBy, prop, equals, curry} = require('ramda');
const destination = [31, 39];
const {Set: set, List: list} = require('immutable');

const isSpace = ([x, y]) => filter(equals('1'), (x * x + 3 * x + 2 * x * y + y + y * y + input).toString(2)).length % 2 === 0;
const h = ([x, y]) => Math.abs(destination[0] - x) + Math.abs(destination[1] - y);
const g = path => path.length;
const neighbors = ([x, y]) => filter(([x, y]) => x >= 0 && y >= 0, [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]);

const initSearch = {
    position: [1, 1],
    path: [],
    f: h([1, 1])
};

const makeSearch = curry((former, p) => {
    const newPath = former.path.concat(former.position);
    const newF = g(newPath) + h(p);
    return {position: p, path: catcat(former.position, former.path), f: newF};
});

const neverRevisited = search => set(search.path.map(list)).size === search.path.length;
const search = pipe(
    sortBy(prop('f')),
    fringe => {
        const best = head(fringe);
        return equals(destination, best.position) ?
            best :
            search(filter(neverRevisited, tail(fringe).concat(map(makeSearch(best), filter(isSpace, neighbors(best.position))))));
    }
);

const part1 = s => search([s]).path.length;

const flood = pipe(
    chain(point => catcat(point, filter(isSpace, neighbors(point)))),
    uniq
);

const floodN = n => reduce(pipe, identity, repeat(flood, n));

const part2 = pipe(
    Array.of,
    floodN(50),
    length
);

console.log('f1', part1(initSearch));
console.log('f2', part2([1, 1]));
