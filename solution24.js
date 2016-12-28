/*eslint no-confusing-arrow: off, no-unused-vars: off*/
const {Set, Map, Record} = require('immutable');
const {pipe, range, xprod, head, isEmpty, over, lensProp, aperture, memoize, concat, splitEvery, sortBy, zipWith, add, equals, chain, __, prop, tail, curry, flip, curryN, filter, map, invoker, addIndex, reduce} = require('ramda');
const reduceIndexed = addIndex(reduce);
const toInt = flip(curryN(2, parseInt))(10);

const pairs = pipe(
    range(0),
    r => xprod(r, r),
    filter(([x, y]) => x !== y),
    map(Set),
    Set,
    invoker(0, 'toJS')
);

const Point = new Record({x: 0, y: 0});
const toPoint = ([x, y]) => new Point({x, y});
const fromPoint = p => [p.get('x'), p.get('y')];

const grids = {
    empty: curry((width, height) => ({width, height, _grid: new Map()})),
    get: curry((p, {_grid}) => _grid.get(toPoint(p))),
    set: curry((p, v, {width, height, _grid}) => ({width, height, _grid: _grid.set(toPoint(p), v)})),
    fromLines: lines =>
        reduceIndexed((grid, line, y) =>
            reduceIndexed((grid, char, x) =>
                grids.set([x, y], char, grid),
                grid,
                line
            ),
            grids.empty(head(lines).length, lines.length),
            lines
        )
};

const translations = [[0, 1], [0, -1], [1, 0], [-1, 0]];
const vectorAdd = zipWith(add);
const WALL = '#';
const mazes = {
    waypoints: memoize(pipe(
        grid => reduce((points, y) =>
            reduce((points, x) => {
                const char = grids.get([x, y], grid);
                return char.match(/\d/) ? points.concat([[toInt(char), x, y]]) : points;
            },
            points,
            range(0, grid.width)),
        [],
        range(0, grid.height)),
        sortBy(head),
        map(tail)
    )),
    isSpace: curry((p, grid) => grids.get(p, grid) !== WALL),
    neighbors: curry((p, grid) => filter(mazes.isSpace(__, grid), map(vectorAdd(p), translations))),
    multiwalk: memoize(curry((start, grid) => {
        const _multiwalk = (depth, distances, horizon) => {
            if (isEmpty(horizon)) {
                return distances;
            }
            const newDistances = reduce((distances, p) => distances.set(toPoint(p), depth), distances, horizon);
            const newHorizon = newDistances
                .filter(equals(depth))
                .keySeq()
                .map(fromPoint)
                .flatMap(mazes.neighbors(__, grid))
                .filter(p => !newDistances.has(toPoint(p)))
                .toJS();
            return _multiwalk(depth + 1, newDistances, newHorizon);
        };
        return _multiwalk(0, new Map(), [start]);
    }))
};

const pairUp = pipe(
    list => ({list, idxPairs: pairs(list.length)}),
    env => env.idxPairs.map(([x, y]) => [[x, env.list[x]], [y, env.list[y]]])
);

const distanceBetween = (from, to, grid) => mazes.multiwalk(from, grid).get(toPoint(to));

const without = (el, arr) => filter(x => !equals(x, el), arr);
const permute = arr => {
    const permTree = arr => isEmpty(arr) ? [] : map(branch => [branch].concat(permTree(without(branch, arr))), arr);
    const treePaths = curry((path, [node, ...children]) => {
        const newPath = path.concat(node);
        return isEmpty(children) ? newPath : chain(treePaths(newPath), children);
    });
    return reduce(concat, [], map(pipe(treePaths([]), splitEvery(arr.length)), permTree(arr)));
};

const solution = extraStep => pipe(
    grids.fromLines,
    grid => ({grid, waypoints: mazes.waypoints(grid)}),
    ({grid, waypoints}) => ({grid, pairs: pairUp(waypoints)}),
    ({grid, pairs}) => ({grid, weights: reduce((distances, [[id1, p1], [id2, p2]]) => distances.set(new Set([id1, id2]), distanceBetween(p1, p2, grid)), new Map(), pairs)}),
    ({grid, weights}) => ({grid, weights, waypoints: mazes.waypoints(grid)}),
    ({weights, waypoints}) => ({weights, perms: map(perm => [0].concat(perm).concat(extraStep), permute(range(1, waypoints.length)))}),
    over(lensProp('perms'), map(aperture(2))),
    ({weights, perms}) => map(perm => [perm, map(win => weights.get(new Set(win)), perm)], perms),
    map(([perm, weights]) => [perm, weights, reduce(add, 0, weights)]),
    sortBy(prop(2)),
    head,
    ([windows, weights, total]) => [head(windows).concat(map(prop(1), tail(windows))).join(''), total]
);

const part1 = solution([]);
const part2 = solution(0);

const scaffold = require('./scaffold');
scaffold.lines(part1, part2);
