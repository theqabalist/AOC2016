const fs = require('fs');
const {split, pipe, map, reduce, filter, identity} = require('ramda');
const transitions1 = {
    1: {R: 2, D: 4},
    2: {R: 3, L: 1, D: 5},
    3: {L: 2, D: 6},
    4: {R: 5, U: 1, D: 7},
    5: {U: 2, D: 8, L: 4, R: 6},
    6: {U: 3, D: 9, L: 5},
    7: {U: 4, R: 8},
    8: {U: 5, L: 7, R: 9},
    9: {U: 6, L: 8}
};

const transitions2 = {
    1: {D: 3},
    2: {R: 3, D: 6},
    3: {R: 4, D: 7, L: 2, U: 1},
    4: {D: 8, L: 3},
    5: {R: 6},
    6: {U: 2, D: 'A', L: 5, R: 7},
    7: {U: 3, D: 'B', L: 6, R: 8},
    8: {U: 4, D: 'C', L: 7, R: 9},
    9: {L: 8},
    A: {U: 6, R: 'B'},
    B: {U: 7, D: 'D', L: 'A', R: 'C'},
    C: {U: 8, L: 'B'},
    D: {U: 'B'}
};
//eslint-disable-next-line no-sync
const input = fs.readFileSync(process.argv[2]).toString();

const executeTable = table => pipe(
    split('\n'),
    filter(identity), //no empty lines
    map(reduce((key, move) => table[key][move] || key, 5))
);

const part1 = executeTable(transitions1);
const part2 = executeTable(transitions2);

console.log(part1(input), part2(input));
