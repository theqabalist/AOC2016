const scaffold = require('./scaffold');
const {Map: createMap, List: list} = require('immutable');
const {reduce, range, length, filter, identity, split, curry, prop, equals, addIndex, cond, T, pipe, assoc, repeat, head, tail, map, last, init} = require('ramda');

const rotateArray = arr => [last(arr)].concat(init(arr));
const mapIndexed = addIndex(map);
const indexArray = mapIndexed((x, i) => [i, x]);
const point = (x, y) => list([x, y]);

const grid = {
    create: (width, height, zero) => ({
        height,
        width,
        layout: reduce((g, column) =>
            reduce((g, row) => g.set(point(column, row), zero), g, range(0, height)), createMap(), range(0, width))
    }),
    column: curry((x, g) => map(y => g.layout.get(point(x, y)), range(0, g.height))),
    row: curry((y, g) => map(x => g.layout.get(point(x, y)), range(0, g.width))),
    set: curry((point, v, g) => assoc('layout', g.layout.set(point, v), g)),
    pretty: g => reduce((s, r) => s.concat(grid.row(r, g).join('')), [], range(0, g.height)).join('\n'),
    rect: curry((a, b, g) =>
        reduce((g, column) =>
            reduce((g, row) => grid.set(point(column, row), '#', g), g, range(0, b)), g, range(0, a))),
    setRow: curry((y, r, g) => reduce((g, [x, v]) => grid.set(point(x, y), v, g), g, indexArray(r))),
    setColumn: curry((x, c, g) => reduce((g, [y, v]) => grid.set(point(x, y), v, g), g, indexArray(c))),
    rotateRow: curry((y, g) => grid.setRow(y, rotateArray(grid.row(y, g)), g)),
    rotateColumn: curry((x, g) => grid.setColumn(x, rotateArray(grid.column(x, g)), g)),
    nRotateRow: curry((n, y, g) => pipe(...repeat(grid.rotateRow(y), n))(g)),
    nRotateColumn: curry((n, x, g) => pipe(...repeat(grid.rotateColumn(x), n))(g)),
    toArray: g =>
        reduce((arr, column) =>
            arr.concat(reduce((arr2, row) => arr2.concat(g.layout.get(point(column, row))), [], range(0, g.height))), [], range(0, g.width))
};

const cap = s => [head(s).toUpperCase()].concat(tail(s)).join('');

const isRect = pipe(prop('type'), equals('rect'));
const parseRect = ({type, parts}) => {
    const [a, b] = parts[0].split('x');
    return {type, a: parseInt(a, 10), b: parseInt(b, 10)};
};

const parseRotate = ({type, parts}) => {
    //eslint-disable-next-line
    const [rot, ord, by, times] = parts;
    return {
        type,
        rot,
        ord: parseInt(ord.slice(2), 10),
        times: parseInt(times, 10)
    };
};

const parseInstruction = pipe(
    split(' '),
    x => ({type: head(x), parts: tail(x)}),
    cond([
        [isRect, parseRect],
        [T, parseRotate]
    ])
);

const interpret = pipe(
    cond([
        [isRect, ins => grid.rect(ins.a, ins.b)],
        [T, ins => grid[`nRotate${cap(ins.rot)}`](ins.times, ins.ord)]
    ])
);

const base = grid.create(50, 6, '.');

const runInstructions = pipe(
    map(parseInstruction),
    map(interpret),
    reduce(pipe, identity),
    f => f(base)
);

const part1 = pipe(
    runInstructions,
    grid.toArray,
    filter(equals('#')),
    length
);

const part2 = pipe(
    runInstructions,
    grid.pretty
);

scaffold.lines(part1, part2);
