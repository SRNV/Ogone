
import { o3 } from './deps.ts';

o3.run({
  entrypoint: 'cli/test/components/index.o3',
  port: 3331,
  modules: '/cli/test/modules',
  build: Deno.args.includes('--production') ? 'dist' : undefined,
  head: `<link href="https://fonts.googleapis.com/css?family=Roboto|Varela+Round" rel="stylesheet"></link>`,
});