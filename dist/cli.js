#!/usr/bin/env node
function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var microbundle = _interopDefault(require('./microbundle.js'));
var sade = _interopDefault(require('sade'));
var fs = _interopDefault(require('fs'));
var es6Promisify = require('es6-promisify');
var chalk = _interopDefault(require('chalk'));

var ref = require('../package');
var version = ref.version;

var toArray = function (val) { return Array.isArray(val) ? val : val == null ? [] : [val]; };

var prog = (function (handler) {
  var cmd = function (type) { return function (str, opts) {
    opts.watch = opts.watch || type === 'watch';
    opts.compress = opts.compress != null ? opts.compress : opts.target !== 'node';
    opts.entries = toArray(str || opts.entry).concat(opts._);
    handler(opts);
  }; };

  var prog = sade('microbundle');
  prog.version(version).option('--entry, -i', 'Entry module(s)').option('--output, -o', 'Directory to place build files into').option('--format, -f', 'Only build specified formats', 'es,cjs,umd').option('--watch, -w', 'Rebuilds on any change', false).option('--target', 'Specify your target environment (node or web)', 'web').option('--external', "Specify external dependencies, or 'none'").option('--globals', "Specify globals dependencies, or 'none'").example('microbundle --globals react=React,jquery=$').option('--define', 'Replace constants with hard-coded values').example('microbundle --define API_KEY=1234').option('--alias', "Map imports to different modules").example('microbundle --alias react=preact').option('--compress', 'Compress output using Terser', null).option('--strict', 'Enforce undefined global context and add "use strict"').option('--name', 'Specify name exposed in UMD builds').option('--cwd', 'Use an alternative working directory', '.').option('--sourcemap', 'Generate source map', true).example("microbundle --no-sourcemap # don't generate sourcemaps").option('--raw', 'Show raw byte size', false).option('--jsx', 'A custom JSX pragma like React.createElement (default: h)').option('--injectStyles', 'Inject CSS into `<head>` (default false)');
  prog.command('build [...entries]', '', {
    default: true
  }).describe('Build once and exit').action(cmd('build'));
  prog.command('watch [...entries]').describe('Rebuilds on any change').action(cmd('watch')); // Parse argv; add extra aliases

  return function (argv) { return prog.parse(argv, {
    alias: {
      o: ['output', 'd'],
      i: ['entry', 'entries', 'e'],
      w: ['watch']
    }
  }); };
});

var readFile = es6Promisify.promisify(fs.readFile); // export const writeFile = promisify(fs.writeFile);

var stat = es6Promisify.promisify(fs.stat);
var stdout = console.log.bind(console); // eslint-disable-line no-console

var stderr = console.error.bind(console);

function logError (err) {
  var error = err.error || err;
  var description = "" + (error.name ? error.name + ': ' : '') + (error.message || error);
  var message = error.plugin ? ("(" + (error.plugin) + " plugin) " + description) : description;
  stderr(chalk.bold.red(message));

  if (error.loc) {
    stderr();
    stderr(("at " + (error.loc.file) + ":" + (error.loc.line) + ":" + (error.loc.column)));
  }

  if (error.frame) {
    stderr();
    stderr(chalk.dim(error.frame));
  } else if (err.stack) {
    var headlessStack = error.stack.replace(message, '');
    stderr(chalk.dim(headlessStack));
  }

  stderr();
}

var run = function (opts) {
  microbundle(opts).then(function (output) {
    if (output != null) { stdout(output); }
    if (!opts.watch) { process.exit(0); }
  }).catch(function (err) {
    process.exitCode = typeof err.code === 'number' && err.code || 1;
    logError(err);
    process.exit();
  });
};

prog(run)(process.argv);
//# sourceMappingURL=cli.js.map