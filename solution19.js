const scaffold = require('./scaffold');
const {subtract} = require('ramda');
const {Range: infRange, Repeat: repeater} = require('immutable');

/* canonical, semantic solution */
// const filterIndexed = addIndex(filter);
// const removeVictim = curry(([id], l) => filter(([xid]) => xid !== id, l));
// const steal = ([x, xn], [y, yn]) => [x, xn + yn];
//
// const rotationReduction = curry((targeter, list) => {
//     const thief = head(list);
//     const sights = targeter(list.length);
//     const victim = list[sights];
//     const crowd = list.slice(1, sights).concat(list.slice(sights + 1));
//     crowd.push(steal(thief, victim));
//     return crowd.length === 1 ? crowd[0] : rotationReduction(targeter, crowd);
// });
//
// const solution = targeter => pipe(
//     x => parseInt(x, 10),
//     range(0),
//     map(inc),
//     map(x => [x, 1]),
//     rotationReduction(targeter)
// );
//
// const part1 = solution(always(1));
// const part2 = solution(length => Math.floor(length / 2.0));

//algorithm designed by mathematical inference of above
const part1 = input => infRange(1)
    .map(x => Math.pow(2, x))
    .flatMap(reps => infRange(reps - 1, -1))
    .zipWith((x, y) => [subtract(y, x), y], infRange(2))
    .skip(input - 2)
    .first();

const part2 = input => infRange(0)
    .map(x => Math.pow(3, x))
    .flatMap(reps => repeater(reps, reps - 1).concat(infRange(reps, -1)))
    .zipWith((x, y) => [subtract(y, x), y], infRange(2))
    .skip(input - 2)
    .first();

scaffold.value(part1, part2);
