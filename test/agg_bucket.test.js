// Copyright (c) 2012, Joyent, Inc. All rights reserved.

var helper = require('./helper.js');
var lib = require('../lib');



///--- Globals

var test = helper.test;



///--- Helpers

function d(date, offset) {
        return (new Date(date.getTime() + (offset * 1000))).toString();
}


function lastDateAtPeriod(period) {
        var nowMillis = (new Date()).getTime();
        return (new Date(nowMillis - (nowMillis % (period * 1000))));
}



///--- Tests

test('test: basic bucket', function (t) {
        var period = 10;
        var field = 'x';
        var ab = lib.createAggBucket({
                timeField: 't',
                field: field,
                period: period
        });
        var n = lastDateAtPeriod(period);
        ab.apply({ t: d(n, 2), x: 1 });
        ab.apply({ t: d(n, 4), x: 1 });
        ab.apply({ t: d(n, 6), x: 1 });
        ab.apply({ t: d(n, 8), x: 1 });
        ab.apply({ t: d(n, 10), x: 1 });
        ab.apply({ t: d(n, 12), x: 2 });
        ab.apply({ t: d(n, 14), x: 3 });
        ab.apply({ t: d(n, 20), x: 10 });

        //Report should only contain one thing: report
        var report = ab.report();
        t.ok(report[field] != undefined);
        t.equal(1, Object.keys(report).length);

        var rep = report[field];
        t.equal(3, rep.n.length);
        t.equal(3, rep.avg.length);
        t.equal(3, rep.sum.length);
        t.deepEqual(rep.n, [ 4, 3, 1 ]);
        t.deepEqual(rep.sum, [ 4, 6, 10 ]);
        t.deepEqual(rep.avg, [ 1, 2, 10 ]);

        t.equal(n.getTime() / 1000, ab.minPeriod);
        t.equal((n.getTime() / 1000) + 20, ab.maxPeriod);

        t.end();
});


test('test: path field', function (t) {
        var period = 10;
        var field = 'x.y.z';
        var ab = lib.createAggBucket({
                timeField: 't.u',
                field: field,
                period: period
        });
        var n = lastDateAtPeriod(period);
        ab.apply({ t: { u: d(n, 2) }, x: { y: { z: 1 } } });
        ab.apply({ t: { u: d(n, 3) }, x: { y: { z: 3 } } });

        //Report should only contain one thing: report
        var report = ab.report();
        t.ok(report[field] != undefined);
        t.equal(1, Object.keys(report).length);

        var rep = report[field];
        t.ok(rep != undefined);
        t.equal(1, rep.n.length);
        t.equal(1, rep.avg.length);
        t.equal(1, rep.sum.length);
        t.deepEqual(rep.n, [ 2 ]);
        t.deepEqual(rep.sum, [ 4 ]);
        t.deepEqual(rep.avg, [ 2 ]);

        t.equal(n.getTime() / 1000, ab.minPeriod);
        t.equal(n.getTime() / 1000, ab.maxPeriod);

        t.end();
});


test('test: multi bucket', function (t) {
        t.end();
});
