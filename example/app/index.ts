import o3 from '../../mod.ts';

// ogone use the root component
o3.run({
  entrypoint: 'example/app/index.o3',
  static: './public',
  port: 8083,
});