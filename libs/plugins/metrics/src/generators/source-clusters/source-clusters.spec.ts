import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import {
  Tree,
  addProjectConfiguration,
  readJson,
  readProjectConfiguration,
} from '@nx/devkit';

import { sourceClustersGenerator } from './source-clusters';
import { SourceClustersGeneratorSchema } from './schema';

describe('source-clusters generator', () => {
  let tree: Tree;
  const options: SourceClustersGeneratorSchema = {
    projectName: 'testprojectA',
  };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    createTestProject(tree);
  });

  it('should run successfully', async () => {
    await sourceClustersGenerator(tree, options);
    const config = readProjectConfiguration(tree, 'testprojectA');
    expect(config).toBeDefined();
  });

  it('should create clusters.json file', async () => {
    await sourceClustersGenerator(tree, options);
    const clusters = tree.read(
      `dist/${
        readProjectConfiguration(tree, 'testprojectA').root
      }/clusters.json`
    );
    expect(clusters).toBeTruthy();
  });

  it('should create clusters.json file with correct content', async () => {
    await sourceClustersGenerator(tree, options);
    const clusters = readJson<string[][]>(
      tree,
      `dist/${
        readProjectConfiguration(tree, 'testprojectA').root
      }/clusters.json`
    );

    const expected = [
      [
        'libs/testprojectA/src/a/b/c/fileA.ts',
        'libs/testprojectA/src/fileB.ts',
        'libs/testprojectA/src/fileC.ts',
      ],
      ['libs/testprojectA/src/fileD.ts', 'libs/testprojectA/src/e/fileE.ts'],
      ['libs/testprojectA/src/f/fileF.ts'],
    ];

    for (const cluster of clusters) {
      expect(expected).toContainEqual(cluster);
    }
  });
});

function createTestProject(tree: Tree) {
  addProjectConfiguration(tree, 'testprojectA', {
    root: 'libs/testprojectA',
    projectType: 'library',
    sourceRoot: `libs/testprojectA/src`,
    targets: {},
  });

  tree.write(
    'libs/testprojectA/src/index.ts',
    `
      export * from './a/b/c/fileA';
      export * from './fileB';
      export * from './fileC';
      export * from './fileD';
      export * from './e/fileE';
      export * from './f/fileF';
      
      export {Component} from '@angular/core';
      `
  );

  tree.write(
    'libs/testprojectA/src/a/b/c/fileA.ts',
    'export const fileA = "fileA";'
  );

  tree.write(
    'libs/testprojectA/src/fileB.ts',
    `
    import { fileA } from './a/b/c/fileA';

    export const fileB = fileA + "fileB";
    `
  );

  tree.write(
    'libs/testprojectA/src/fileC.ts',
    `
    import { fileB } from './fileB';
    import { fileA } from './a/b/c/fileA';

    export const fileC = fileB + "fileC";
    `
  );

  tree.write(
    'libs/testprojectA/src/fileD.ts',
    `
    export const fileD = "fileD";
    `
  );

  tree.write(
    'libs/testprojectA/src/e/fileE.ts',
    `
    import { fileD } from '../fileD';

    export const fileE = fileD + "fileE";
    `
  );

  tree.write(
    'libs/testprojectA/src/f/fileF.ts',
    `
    export const fileF =  "fileF";
    `
  );

  tree.write('libs/testprojectA/tsconfig.json', JSON.stringify({}));
  tree.write(
    'tsconfig.base.json',
    JSON.stringify({
      compileOnSave: false,
      compilerOptions: {
        rootDir: '.',
        sourceMap: true,
        declaration: false,
        moduleResolution: 'node',
        emitDecoratorMetadata: true,
        experimentalDecorators: true,
        importHelpers: true,
        target: 'es2015',
        module: 'esnext',
        lib: ['es2020', 'dom'],
        skipLibCheck: true,
        skipDefaultLibCheck: true,
        baseUrl: '.',
        paths: {
          '@circular-deps/testprojectA': ['libs/testprojectA/src/index.ts'],
        },
      },
      exclude: ['node_modules', 'tmp'],
    })
  );

  tree.write('libs/testprojectA/jest.config.js', 'module.exports = {};');
  tree.write('libs/testprojectA/src/hello.txt', 'hello world');
}
