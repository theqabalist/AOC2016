const scaffold = require('./scaffold');
const {curry, indexOf, map, min, prop, last, join, equals, max, head, isEmpty, flatten, range, tail, pipe, filter, identity, reduce} = require('ramda');
const assert = require('assert');

const sliceAround = (i, arr) => arr.slice(0, i).concat(arr.slice(i + 1));
//eslint-disable-next-line
const perms = arr => arr.length === 1 ? arr : map(flatten, reduce((ps, i) => {
    const branch = arr[i];
    const smaller = sliceAround(i, arr);
    const subs = map(x => [branch, x], perms(smaller));
    return ps.concat(subs);
}, [], range(0, arr.length)));

const V = {
    //eslint-disable-next-line
    rotate: curry((dir, n, v) => n === 0 ? v : V.rotate(dir, n - 1, v.slice(dir).concat(v.slice(0, dir)))),
    rotateByIndexOf: curry((char, v) => {
        const candidate = indexOf(char, v) + 1;
        return V.rotate(-1, candidate + (candidate > 4 ? 1 : 0), v);
    }),
    swapPosition: curry((i, j, v) => v
        .slice(0, min(i, j))
        .concat(v[max(i, j)])
        .concat(v.slice(min(i, j) + 1, max(i, j)))
        .concat(v[min(i, j)])
        .concat(v.slice(max(i, j) + 1))),
    swapLetters: curry((x, y, v) => V.swapPosition(indexOf(x, v), indexOf(y, v), v)),
    reverseSub: curry((low, high, v) => v
        .slice(0, low)
        .concat(v.slice(low, high + 1).reverse())
        .concat(v.slice(high + 1))),
    moveIndex: curry((i, j, v) => {
        const removed = v.slice(0, i).concat(v.slice(i + 1));
        return removed.slice(0, j)
            .concat(v[i])
            .concat(removed.slice(j));
    })
};

const transitions = {
    rotate: {
        left: V.rotate(1),
        right: V.rotate(-1),
        based: V.rotateByIndexOf
    },
    swap: {
        letter: V.swapLetters,
        position: V.swapPosition
    },
    move: {position: V.moveIndex},
    reverse: {positions: V.reverseSub}
};

const types = [
    /(rotate) (\w+) (\d+) steps?/,
    /(rotate) (based) on position of letter (\w)/,
    /(swap) (letter) (\w) with letter (\w)/,
    /(swap) (position) (\d+) with position (\d+)/,
    /(move) (position) (\d+) to position (\d+)/,
    /(reverse) (positions) (\d+) through (\d+)/
];
//eslint-disable-next-line
const intParams = parts => !parseInt(parts[2], 10) && parseInt(parts[2], 10) !== 0 ? parts : parts.slice(0, 2).concat(map(x => parseInt(x, 10), parts.slice(2)));
const parseLine = line => pipe(
    map(re => line.match(re)),
    filter(identity),
    head,
    tail,
    intParams,
    ([ins, mod, ...args]) => transitions[ins][mod](...args)
)(types);

const runTransitions = curry((v, transitions) => {
    if (isEmpty(transitions)) {
        return v;
    }
    assert(head(transitions)(v).length === v.length, head(transitions).debug.concat([v]).concat([head(transitions)(v)]).join('\n'));
    return runTransitions(head(transitions)(v), tail(transitions));
});

const part1 = pipe(
    map(parseLine),
    runTransitions('abcdefgh'.split('')),
    join('')
);

const part2 = pipe(
    map(parseLine),
    transitions => map(x => [x, runTransitions(x, transitions)], perms('abcdefgh'.split(''))),
    map(x => [x[0], x[1].join('')]),
    filter(pipe(last, equals('fbgdceah'))),
    map(prop(0)),
    head,
    join('')
);

scaffold.lines(part1, part2);
