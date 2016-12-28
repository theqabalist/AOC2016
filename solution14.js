//http://adventofcode.com/2016/day/14
const scaffold = require('./scaffold');
const {identity, over, memoize, curry, repeat, tap, lensIndex, prop, pipe, reduceRight} = require('ramda');
const {Range: infRange} = require('immutable');
const md5 = require('md5');

const solved = curry((hasher, input) => infRange()
    .map(i => [i, hasher(`${input}${i}`), infRange(i + 1, i + 1000).map(i => hasher(`${input}${i}`))])
    .map(over(lensIndex(1), hash => hash.match(/(.)\1\1/)))
    .filter(pipe(prop(1), identity))
    .filter(([i, match, nx1k]) => nx1k.find(hash => hash.match(new RegExp(repeat(match[1], 5).join('')))))
    .map(x => [x[0], x[1].input])
    .map(tap(console.log))
    .take(64));

scaffold.value(solved(md5), solved(memoize(reduceRight(pipe, identity, repeat(md5, 2017)))));
