const input = require('./input');
const {pipe, split, intersection, converge, compose, prop, concat, map, length, join, or, filter, any, none, aperture, dissoc, over, curry, invoker, reduce, assoc, lensProp} = require('ramda');

const removeNets = curry((nets, original) =>
    reduce((final, hypernet) => final.replace(hypernet, ' '), original, nets));

const slice2 = invoker(2, 'slice');

const isAbba = s => s[0] !== s[1] && s[0] === s[3] && s[1] === s[2];

const hasAbba = pipe(
    aperture(4),
    map(join('')),
    map(isAbba),
    reduce(or, false)
);

const isAba = s => s[0] !== s[1] && s[0] === s[2];

const collectAbas = pipe(
    aperture(3),
    map(join('')),
    filter(isAba)
);

const collectAbasFromMulti = pipe(
    map(collectAbas),
    reduce(concat, [])
);

const addressesAndNets = pipe(
    split('\n'),
    map(x => ({
        original: x,
        hypernets: x.match(/\[[a-z]+\]/g) || []
    })),
    map(x => assoc('addresses', removeNets(x.hypernets, x.original), x)),
    map(dissoc('original')),
    map(over(lensProp('addresses'), split(' '))),
    map(over(lensProp('hypernets'), map(slice2(1, -1))))
);

const part1 = pipe(
    addressesAndNets,
    filter(x => any(hasAbba, x.addresses) && none(hasAbba, x.hypernets)),
    length
);

const invertAba = s => `${s[1]}${s[0]}${s[1]}`;

const part2 = pipe(
    addressesAndNets,
    map(x => assoc('abas', collectAbasFromMulti(x.addresses), x)),
    map(x => assoc('babs', collectAbasFromMulti(x.hypernets), x)),
    filter(converge(compose(length, intersection), [prop('abas'), compose(map(invertAba), prop('babs'))])),
    length
);

console.log(part1(input), part2(input));
