const scaffold = require('./scaffold');
const {map, last, curry, head, all, inc, isEmpty, pipe, sortBy, prop, reduce, partition} = require('ramda');

const parseLine = line => {
    const [match, min, max] = line.match(/(\d+)-(\d+)/).map(x => parseInt(x, 10));
    return {min, max};
};

const deepenConsolidation = curry((consolidated, ranges) => {
    if (all(min => min > consolidated.max + 1, map(prop('min'), ranges))) {
        return [consolidated, ranges];
    }
    const [consolidatable, remaining] = partition(range => range.min <= consolidated.max + 1, [consolidated].concat(ranges));
    const consolidation = {min: consolidated.min, max: last(sortBy(prop('max'), consolidatable)).max};
    return deepenConsolidation(consolidation, remaining);
});

const rangeConsolidation = curry((consolidated, ranges) => {
    if (isEmpty(ranges)) {
        return consolidated;
    }
    const [consolidation, remaining] = deepenConsolidation(head(ranges), ranges);
    return rangeConsolidation(consolidated.concat(consolidation), remaining);
});

const consolidatedRanges = pipe(
    map(parseLine),
    sortBy(prop('min')),
    rangeConsolidation([])
);

const part1 = pipe(
    consolidatedRanges,
    head,
    prop('max'),
    inc
);

const part2 = pipe(
    consolidatedRanges,
    reduce(([total, lastRange], range) => [total + range.min - 1 - lastRange.max, range], [0, {max: -1}]),
    head
);

scaffold.lines(part1, part2);
