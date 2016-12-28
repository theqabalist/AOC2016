/*eslint no-confusing-arrow: off */
const input = require('./input');
const {pipe, split, init, last, curry, identity} = require('ramda');

const lines = pipe(
    split('\n'),
    ls => last(ls) === '' ? init(ls) : ls
);

const value = pipe(
    lines,
    last
);

const io = curry((scaffolding, f1, f2) => {
    const structured = scaffolding(input);
    console.log('f1:');
    console.log(f1(structured));
    console.log('f2:');
    console.log(f2(structured));
});

module.exports = {
    lines: io(lines),
    value: io(value),
    raw: io(identity)
};
