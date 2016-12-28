/*eslint no-confusing-arrow: off*/
const {Set: makeSet} = require('immutable');
const {repeat, pipe, partition, prop, tail, find, uniqBy, inc, zipWith, add, chain, subtract, __, not, addIndex, map, xprod, invoker, head, last, reduce, filter, equals, range} = require('ramda');
const numFloors = parseInt(process.argv[2], 10);
const numPairs = parseInt(process.argv[3], 10);
const startingState = process.argv[4].split('').map(x => parseInt(x, 10));
const finalState = repeat(numFloors - 1, numPairs * 2 + 1);

const floorRange = range(0, numFloors);
const floorCount = floors => reduce((count, floor) => count.concat(filter(equals(floor), floors).length), [], floorRange);
const mapIndexed = addIndex(map);

const matchedCouples = x => {
    const indexed = mapIndexed((x, i) => [i, x], x.m);
    return reduce((matched, [i, m]) => matched && (x.ghist[m] === 0 || x.g[i] === m), true, indexed);
};

const partitionIndexed = addIndex(partition);
const splitInHalf = partitionIndexed((x, i, c) => i % c.length % 2 === 0);
const elevatorInBuilding = x => x.e >= 0 && x.e < numFloors;
const buildingEmpty = x => x.m.length + x.g.length === 0;
const floorNotEmpty = x => x.mhist[x.e] > 0 || x.ghist[x.e] > 0;
const validate = pipe(
    x => [head(x)].concat(splitInHalf(tail(x))),
    x => ({e: x[0], m: x[1], g: x[2], mhist: floorCount(x[1]), ghist: floorCount(x[2])}),
    x => elevatorInBuilding(x) && (buildingEmpty(x) || floorNotEmpty(x) && matchedCouples(x))
);

const movableIndexes = ([elevator, ...riders]) => map(pipe(head, inc), filter(pipe(last, equals(elevator)), mapIndexed((x, i) => [i, x], riders)));

// const changeVectorFromIndexes = pipe(
//     map(map(i => set(lensIndex(i), 1))),
//     map(reduce(pipe, identity)),
//     map(f => f([1].concat(repeat(0, numPairs * 2))))
// );

const changeVectorFromIndexes = movers => {
    const moves = [];
    movers.forEach(mover => {
        const changes = [1].concat(repeat(0, numPairs * 2));
        mover.forEach(index => {
            changes[index] = 1;
        });
        moves.push(changes);
    });
    return moves;
};

const elevatorChoices = pipe(
    x => xprod(x, x),
    map(makeSet),
    makeSet,
    set => set.toJS(),
    changeVectorFromIndexes
);

const expandPosition = pipe(
    x => [x, elevatorChoices(movableIndexes(x))],
    ([x, moves]) => chain(move => [zipWith(add, x, move), zipWith(subtract, x, move)], moves),
    filter(validate)
);

const expandSearch = ({path, length, head}) => map(
    p => ({head: p, path: path.concat([p]), length: length + 1}),
    expandPosition(head)
);

const initSearch = head => ({head, path: [head], length: 0});
const slug = ({head}) => head.join('');

const searchHead = prop('head');
const has = invoker(1, 'has');
const dedupBySlug = uniqBy(slug);
const expandFringe = chain(expandSearch);
const searchForFinal = (memo, fringe, depth) => {
    const slugNotInMemo = pipe(slug, has(__, memo), not);
    console.log(`depth: ${depth}, fringe: ${fringe.length}`);
    const expanded = dedupBySlug(filter(slugNotInMemo, expandFringe(fringe)));
    const finalReached = find(pipe(searchHead, equals(finalState)), expanded);
    return finalReached || searchForFinal(
        memo.union(makeSet(map(slug, expanded))),
        expanded,
        depth + 1
    );
};

const part1 = pipe(
    initSearch,
    search => searchForFinal(makeSet(), [search], 0)
);

console.log(part1(startingState));
