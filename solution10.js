const scaffold = require('./scaffold');
const {pipe, toPairs, all, take, multiply, reduce, lensIndex, min, max, clone, prop, partition, groupBy, curry, find, intersection, fromPairs, assoc, filter, identity, flip, sortBy, head, last, curryN, over, lensProp, map} = require('ramda');
const bots = lensProp('bots');
const values = lensProp('values');
const toInt = flip(curryN(2, parseInt))(10);

const parseBot = s => {
    const match = s.match(/bot (\d+) gives low to (bot|output) (\d+) and high to (bot|output) (\d+)/);
    //eslint-disable-next-line
    const [_, bot, lowType, lowAddr, highType, highAddr] = match;
    return [
        toInt(bot),
        {
            num: toInt(bot),
            low: {type: lowType, num: toInt(lowAddr)},
            high: {type: highType, num: toInt(highAddr)},
            values: []
        }
    ];
};

const botArrayFromConfig = pipe(
    map(parseBot),
    sortBy(head),
    map(last)
);

const parseValue = s => {
    const match = s.match(/value (\d+) goes to bot (\d+)/);
    //eslint-disable-next-line
    const [_, value, bot] = match;
    return [toInt(bot), toInt(value)];
};

const compact = filter(identity);
const assignValuesToBots = world => world.bots.map(bot => assoc('values', compact([].concat(world.values[bot.num])).sort(), bot));

const handleBranch = curry((cmp, branch, values, outs, bots) => {
    const val = cmp(...values);
    if (branch.type === 'bot') {
        bots[branch.num].values.push(val);
    } else {
        outs[branch.num] = val;
    }
});

const handleLow = ({values, low: branch}, outs, bots) => {
    handleBranch(min, branch, values, outs, bots);
};

const handleHigh = ({values, high: branch}, outs, bots) => {
    handleBranch(max, branch, values, outs, bots);
};

const runBotsUntil = curry((botsPredicate, outputs, bots) => {
    const active = find(bot => bot.values.length === 2, bots);
    const newBots = clone(bots);
    const newOuts = clone(outputs);
    handleLow(active, newOuts, newBots);
    handleHigh(active, newOuts, newBots);
    newBots[active.num].values = [];
    const criteria = botsPredicate(newBots);
    return criteria ? [criteria, newOuts] : runBotsUntil(botsPredicate, newOuts, newBots);
});

const mapValues = f => pipe(
    toPairs,
    map(over(lensIndex(1), f)),
    fromPairs
);

const prepareWorld = pipe(
    partition(x => x.match(/^bot/)),
    ([bots, values]) => ({bots, values}),
    over(bots, botArrayFromConfig),
    over(values, pipe(map(parseValue), groupBy(head), mapValues(map(prop(1))))),
    assignValuesToBots
);

const part1 = pipe(
    prepareWorld,
    runBotsUntil(find(bot => intersection([17, 61], bot.values).length === 2), {})
);

const part2 = pipe(
    prepareWorld,
    runBotsUntil(all(bot => bot.values.length < 2), {}),
    prop(1),
    toPairs,
    map(over(lensIndex(0), toInt)),
    sortBy(head),
    map(prop(1)),
    take(3),
    reduce(multiply, 1)
);

scaffold.lines(part1, part2);
