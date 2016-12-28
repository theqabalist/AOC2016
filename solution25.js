/*eslint no-confusing-arrow: off*/
const scaffold = require('./scaffold');
const {pipe, set, curry, over, lensProp, inc, repeat, dec, head, tail} = require('ramda');
const {inspect} = require('util');
const {usleep} = require('sleep');

const initMachine = curry((a, instructions) => ({
    pc: 8,
    registers: {
        a,
        b: 0,
        c: 0,
        d: 7 * 362 + a
    },
    instructions,
    clock: 0
}));

const transitions = {
    out: curry(([v], {pc, registers, instructions}) => ({pc: pc + 1, registers, instructions, clock: isNaN(parseInt(v, 10)) ? registers[v] : v})),
    cpy: curry(([value, register], {pc, registers, instructions, clock}) => isNaN(parseInt(value, 10)) ?
        {pc: pc + 1, registers: set(lensProp(register), registers[value], registers), instructions, clock} :
        {pc: pc + 1, registers: set(lensProp(register), parseInt(value, 10), registers), instructions, clock}),
    inc: curry((register, {pc, registers, instructions, clock}) => ({pc: pc + 1, registers: over(lensProp(register), inc, registers), instructions, clock})),
    dec: curry((register, {pc, registers, instructions, clock}) => ({pc: pc + 1, registers: over(lensProp(register), dec, registers), instructions, clock})),
    jnz: curry(([nz, value], {pc, registers, instructions, clock}) => {
        const condition = parseInt(nz, 10) || registers[nz];
        return {
            pc: pc + (condition ? parseInt(value, 10) : 1),
            registers,
            instructions,
            clock
        };
    })
};

const rightFill = (n, s) => s.length < n ? s + repeat(' ', n - s.length).join('') : s;

const runMachine = ({pc, registers, instructions, clock}) => {
    const machine = {pc, registers, instructions, clock};
    if (pc >= instructions.length) {
        return machine;
    }
    console.log(`${clock}\t${pc}\t${rightFill(8, instructions[pc])}\t${inspect(registers)}`);
    usleep(1000);
    const instruction = instructions[pc].split(' ');
    return runMachine(transitions[head(instruction)](tail(instruction), machine));
};

const part1 = pipe(
    initMachine(196),
    runMachine
);

scaffold.lines(part1, () => {});
