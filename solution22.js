const scaffold = require('./scaffold');
const {pipe, tail, range, reduce, find, map, curry, assoc, filter, prop, tap, lte, chain, length} = require('ramda');
const {inspect} = require('util');

const parseLine = line => map(x => parseInt(x, 10), tail(line.match(/\/dev\/grid\/node-x(\d+)-y(\d+)\s+(\d+)T\s+(\d+)T\s+(\d+)T\s+(\d+)%/)));
const astify = ([x, y, size, used, avail, perc]) => ({x, y, size, used, avail, perc});
const adjacency = curry((nodes, node) => assoc('adj', node.used === 0 ? [] : filter(n2 => n2.avail >= node.used, nodes), node));

const classifyNode = ([width, column], [height, row], node) =>
    row === 0 && column === width - 1 ? 'G' :
    node.size > 200 ? '#' :
    node.used === 0 ? '_' :
    column === 0 && row === 0 ? 'o' : '.';
const draw = curry((width, height, nodes) =>
    reduce((rows, row) =>
        rows.concat(reduce((columns, column) =>
            columns.concat(classifyNode([width, column], [height, row], find(node => node.x === column && node.y === row, nodes))),
            [],
            range(0, width)).join('')),
        [],
        range(0, height)).join('\n'));

const part1 = pipe(
    pipe(tail, tail),
    map(parseLine),
    map(astify),
    nodes => map(adjacency(nodes), nodes),
    chain(prop('adj')),
    length
);

const part2 = pipe(
    pipe(tail, tail),
    map(parseLine),
    map(astify),
    nodes => map(adjacency(nodes), nodes),
    draw(32, 30)
);

scaffold.lines(part1, part2);
