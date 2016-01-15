var run = require('./run-sequence');

run.test(run.start, run.kill, run.replace, run.stop);
