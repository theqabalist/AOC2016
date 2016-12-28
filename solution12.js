/*eslint no-confusing-arrow: off*/
const scaffold = require('./scaffold');
const {pipe, set, curry, over, lensProp, inc, dec, head, tail} = require('ramda');

const initMachine = curry((c, instructions) => ({
    pc: 0,
    registers: {
        a: 0,
        b: 0,
        c,
        d: 0
    },
    instructions
}));

const transitions = {
    cpy: curry(([value, register], {pc, registers, instructions}) => parseInt(value, 10) ?
        {pc: pc + 1, registers: set(lensProp(register), parseInt(value, 10), registers), instructions} :
        {pc: pc + 1, registers: set(lensProp(register), registers[value], registers), instructions}),
    inc: curry((register, {pc, registers, instructions}) => ({pc: pc + 1, registers: over(lensProp(register), inc, registers), instructions})),
    dec: curry((register, {pc, registers, instructions}) => ({pc: pc + 1, registers: over(lensProp(register), dec, registers), instructions})),
    jnz: curry(([nz, value], {pc, registers, instructions}) => {
        const condition = parseInt(nz, 10) || registers[nz];
        return {
            pc: pc + (condition ? parseInt(value, 10) : 1),
            registers,
            instructions
        };
    })
};

const runMachine = ({pc, registers, instructions}) => {
    const machine = {pc, registers, instructions};
    if (pc >= instructions.length) {
        return machine;
    }
    const instruction = instructions[pc].split(' ');
    return runMachine(transitions[head(instruction)](tail(instruction), machine));
};

const part1 = pipe(
    initMachine(0),
    runMachine
);

const part2 = pipe(
    initMachine(1),
    runMachine
);

scaffold.lines(part1, part2);
