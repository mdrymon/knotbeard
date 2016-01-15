var run = require('./run-sequence');

run.test(run.start, run.replace, run.stop, run.replace, run.stop);
