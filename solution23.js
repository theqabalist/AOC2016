/*eslint no-confusing-arrow: off*/
const scaffold = require('./scaffold');
const {pipe, set, curry, join, reduce, and, prop, map, split, lensIndex, __, over, lensProp, inc, dec, head, tail} = require('ramda');
const {sleep} = require('sleep');

const initMachine = curry((a, instructions) => ({
    pc: 0,
    registers: {
        a,
        b: 0,
        c: 0,
        d: 0
    },
    instructions
}));

const tglMap = {
    inc: 'dec',
    dec: 'inc',
    tgl: 'inc',
    jnz: 'cpy',
    cpy: 'jnz'
};

const toggleInstruction = pipe(
    split(' '),
    over(lensIndex(0), prop(__, tglMap)),
    ins => head(ins) === 'cpy' && reduce(and, true, map(x => !isNaN(parseInt(x, 10)), tail(ins))) ? 'cpy a a' : ins,
    join(' ')
);

const transitions = {
    cpy: curry(([value, register], {pc, registers, instructions}) => !isNaN(parseInt(value, 10)) ?
        {pc: pc + 1, registers: set(lensProp(register), parseInt(value, 10), registers), instructions} :
        {pc: pc + 1, registers: set(lensProp(register), registers[value], registers), instructions}),
    inc: curry((register, {pc, registers, instructions}) => ({pc: pc + 1, registers: over(lensProp(register), inc, registers), instructions})),
    dec: curry((register, {pc, registers, instructions}) => ({pc: pc + 1, registers: over(lensProp(register), dec, registers), instructions})),
    jnz: curry(([nz, v], {pc, registers, instructions}) => {
        const condition = parseInt(nz, 10) || registers[nz];
        const value = parseInt(v, 10) || registers[v];
        return {
            pc: pc + (condition ? parseInt(value, 10) : 1),
            registers,
            instructions
        };
    }),
    tgl: curry((tg, {pc, registers, instructions}) => {
        const distance = parseInt(tg, 10) || registers[tg];
        return {
            pc: pc + 1,
            registers,
            instructions: over(lensIndex(pc + distance), x => x ? toggleInstruction(x) : x, instructions)
        };
    })
};

const runMachine = ({pc, registers, instructions}) => {
    const machine = {pc, registers, instructions};
    if (pc >= instructions.length) {
        return machine;
    }
    const instruction = instructions[pc].split(' ');
    if (registers.d % 100000 === 0 && registers.c === 0 || pc >= 10) {
        console.log(registers);
        global.gc();
    }
    return runMachine(transitions[head(instruction)](tail(instruction), machine));
};

const part1 = pipe(
    initMachine(7),
    runMachine
);

const part2 = pipe(
    initMachine(12),
    runMachine
);

scaffold.lines(part1, part2);
