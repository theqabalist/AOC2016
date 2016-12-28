const scaffold = require('./scaffold');
const {pipe, length, curry, curryN, flip, reduce} = require('ramda');
const niceParseInt = flip(curryN(2, parseInt))(10);

const states = {
    create: (name, local, params, total) => ({name, localBuffer: local, totalBuffer: total, params}),
    consumeChar: curry((char, state) => states.create(state.name, state.localBuffer.concat(char), state.params, state.totalBuffer)),
    flush: state => state.totalBuffer + state.localBuffer.length
};

const defaultState = states.create('uncompressed', [], {}, 0);

const transitions = cont => ({
    uncompressed: {
        '(': (char, state) => states.create('control', [char], {}, state.totalBuffer + state.localBuffer.length),
        else: states.consumeChar
    },
    control: {
        ')': (char, state) => {
            const controlSeq = state.localBuffer.concat(char).join('');
            const [count, times] = controlSeq.slice(1, -1).split('x').map(niceParseInt);
            return states.create('compressed', [], {count: count - 1, times}, state.totalBuffer);
        },
        else: states.consumeChar
    },
    compressed: {
        //eslint-disable-next-line
        else: (char, state) => state.params.count === 0 ?
                states.create('uncompressed', [], {}, state.totalBuffer + cont(state.localBuffer.concat(char).join('')) * state.params.times) :
                states.create('compressed', state.localBuffer.concat(char), {count: state.params.count - 1, times: state.params.times}, state.totalBuffer)
    }
});

const part1 = pipe(
    reduce((state, char) => (transitions(length)[state.name][char] || transitions(length)[state.name].else)(char, state), defaultState),
    states.flush
);

const part2 = pipe(
    reduce((state, char) => (transitions(part2)[state.name][char] || transitions(part2)[state.name].else)(char, state), defaultState),
    states.flush
);

scaffold.value(part1, part2);
