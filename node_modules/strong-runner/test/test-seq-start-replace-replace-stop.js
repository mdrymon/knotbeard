var run = require('./run-sequence');

run.test(run.start, run.replace, run.replace, run.stop);
