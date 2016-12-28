/*eslint no-confusing-arrow: off*/
module.exports = (function ({curry, call, complement, identity, tap, invoker, pipe, init, map, filter, reduce, is, not, compose, lte, equals, head, last, fromPairs}) {
    const iterate = curry((f, base) => () => [base, iterate(f, f(base))]);
    const coreq = {
        head: pipe(call, head),
        tail: pipe(call, last),
        map: curry((f, iter) => () => [f(coreq.head(iter)), coreq.map(f, coreq.tail(iter))]),
        filter: curry((pred, iter) => {
            const h = coreq.head(iter);
            return pred(h) ?
                () => [h, coreq.filter(pred, coreq.tail(iter))] :
                coreq.filter(pred, coreq.tail(iter));
        }),
        skip: curry((n, iter) => n === 0 ? iter : coreq.skip(n - 1, coreq.tail(iter))),
        skipWhile: curry((pred, iter) => coreq.filter(complement(pred), iter)),
        take: curry((n, iter) => n === 0 ? [] : [coreq.head(iter)].concat(coreq.take(n - 1, coreq.tail(iter)))),
        zipWith: curry((f, other, iter) => () => [f(coreq.head(other), coreq.head(iter)), coreq.zipWith(f, coreq.tail(other), coreq.tail(iter))]),
        zip: x => coreq.zipWith((...args) => args, x),
        switch: iter => coreq.head(iter),
        switchMap: curry((f, iter) => f(coreq.head(iter))),
        iterate,
        forever: iterate(identity),
        tap: curry((f, iter) => () => [tap(f)(coreq.head(iter)), coreq.tap(f, coreq.tail(iter))])
    };
    return {
        catcat: curry((elem, arr) => arr.concat([elem])),
        interface: obj => pipe(
            x => {
                const keys = [];
                //eslint-disable-next-line
                for (const key in x) {
                    keys.push(key);
                }
                return keys;
            },
            filter(x => is(Function, obj[x])),
            map(name => [obj[name].length, name]),
            filter(compose(lte(0), head)),
            filter(compose(not, equals('_'), head, last)),
            map(args => [last(args), invoker(args[0], args[1])]),
            fromPairs
        )(obj),
        histogram: reduce((hist, e) => {
            const working = last(hist) || [null, null];
            const [context, amount] = working;
            const stem = context === e ? init(hist) : hist;
            const newWorking = context === e ? [context, amount + 1] : [e, 1];
            return stem.concat(Array.of(newWorking));
        }, []),
        instrument: (msg, f) => (...args) => {
            const start = new Date().getTime();
            const result = f(...args);
            const end = new Date().getTime();
            console.log(`${msg}: ${end - start}`);
            return result;
        },
        coreq
    };
}(
    require('ramda')
));
