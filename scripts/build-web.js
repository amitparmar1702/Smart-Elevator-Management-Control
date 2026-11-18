process.env.NEXT_TELEMETRY_DISABLED = '1';
process.chdir(__dirname + '/../apps/web');
process.argv = [process.argv[0], 'next', 'build', '--no-lint'];
require('next/dist/bin/next');
