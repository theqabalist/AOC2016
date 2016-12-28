/*eslint no-confusing-arrow: off*/
const scaffold = require('./scaffold');
const {coreq} = require('./helper');
const {head, pipe, filter, equals} = require('ramda');

const trap = '^';
const safe = '.';
const trapIf = ['^^.', '.^^', '^..', '..^'];
const iteratableFromInput = input => {
    const span = input.length;
    return ([safeCount, iteration]) => {
        const newIndex = iteration.length;
        const left = newIndex % span === 0 ? safe : iteration[newIndex - span - 1];
        const center = iteration[newIndex - span];
        const right = newIndex % span === span - 1 ? safe : iteration[newIndex - span + 1];
        const newIteration = iteration + (trapIf.includes(left + center + right) ? trap : safe);
        if (newIteration.length === span * 2) {
            const pruned = newIteration.slice(0, span);
            const forward = newIteration.slice(span);
            return [safeCount + filter(equals(safe), pruned).length, forward];
        }
        return [safeCount, newIteration];
    };
};

const safeInRows = rows => pipe(
    input => [iteratableFromInput(input), input],
    ([iteratable, input]) => [coreq.iterate(iteratable, [0, input]), input],
    ([iter, input]) => coreq.skip(input.length * rows, iter),
    coreq.take(1),
    head,
    head
);

const part1 = safeInRows(40);
const part2 = safeInRows(400000);

scaffold.value(part1, part2);
