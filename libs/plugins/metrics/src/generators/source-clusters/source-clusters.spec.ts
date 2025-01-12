import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readJson, readProjectConfiguration } from '@nx/devkit';

import { createTestProject } from '@circular-deps/test-utils';

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
      `dist/metrics/${
        readProjectConfiguration(tree, 'testprojectA').root
      }/clusters.json`
    );
    expect(clusters).toBeTruthy();
  });

  it('should create clusters.json file with correct content', async () => {
    await sourceClustersGenerator(tree, options);
    const clusters = readJson<string[][]>(
      tree,
      `dist/metrics/${
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
