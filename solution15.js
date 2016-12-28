const scaffold = require('./scaffold');
const {pipe, map, tail, addIndex, all, equals} = require('ramda');
const {Range: clock} = require('immutable');

const lineRe = /Disc #(\d+) has (\d+) positions; at time=0, it is at position (\d+)./;
const parseLine = line => {
    const [size, position] = tail(tail(map(x => parseInt(x, 10), line.match(lineRe))));
    return {size, position};
};

const mapIndexed = addIndex(map);
const runSystem = (system, t) => mapIndexed((disc, i) => (disc.position + t + i + 1) % disc.size, system);

const findOpening = system => clock()
    .map(t => [t, runSystem(system, t)])
    //eslint-disable-next-line
    .filter(([t, alignments]) => all(equals(0), alignments))
    .take(1);

const part1 = pipe(
    map(parseLine),
    findOpening
);

const part2 = pipe(
    map(parseLine),
    lines => lines.concat({size: 11, position: 0}),
    findOpening
);

scaffold.lines(part1, part2);
