const scaffold = require('./scaffold');
const md5 = require('md5');
const {pipe, map, head, filter, prop, toPairs, curry, find, concat, equals, complement, chain, take, reduce, zipWith, add, all} = require('ramda');
const moves = {U: [0, 1], D: [0, -1], L: [1, 0], R: [-1, 0]};

const actualPosition = pipe(
    map(x => moves[x]),
    reduce(zipWith(add), [3, 3])
);
const inBounds = dim => dim >= 0 && dim <= 3;
const inRoomAfterPath = pipe(
    actualPosition,
    all(inBounds)
);

const doorsForPath = (input, path) => {
    const [U, D, L, R] = map(x => parseInt(x, 16) > 10, take(4, md5(`${input}${path}`)));
    return map(head, filter(prop(1), toPairs({U, D, L, R})));
};

const expand = curry((input, path) => map(concat(path), doorsForPath(input, path)));


const part1 = curry((fringe, input) => {
    const finished = filter(path => equals([0, 0], actualPosition(path)), fringe);
    if (fringe.length === 0 && !finished) {
        throw new Error('No solution.');
    }
    return finished.length ? finished : part1(filter(inRoomAfterPath, chain(expand(input), fringe)), input);
});

const removeVaultPaths = pipe(actualPosition, complement(equals)([0, 0]));
const part2 = curry((fringe, maximum, depth, input) => {
    const expandedFringe = filter(inRoomAfterPath, chain(expand(input), fringe));
    const candidate = find(path => equals([0, 0], actualPosition(path)), expandedFringe) || maximum;
    return fringe.length === 0 ? candidate : part2(filter(removeVaultPaths, expandedFringe), candidate, depth + 1, input);
});

scaffold.value(pipe(part1(['']), head), pipe(part2([''], null, 0), prop('length')));
