import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readJson, readProjectConfiguration } from '@nx/devkit';

import { linesOfCodeGenerator } from './lines-of-code';
import { LinesOfCodeGeneratorSchema } from './schema';
import { createTestProject } from '@circular-deps/test-utils';

describe('lines-of-code generator', () => {
  let tree: Tree;
  const options: LinesOfCodeGeneratorSchema = { projectName: 'testprojectA', fileExtensions: ['ts', 'html'] };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
    createTestProject(tree);
  });

  it('should run successfully', async () => {
    const config = readProjectConfiguration(tree, 'testprojectA');
    expect(config).toBeDefined();
  });

  it('should create lines-of-code.json file', async () => {
    await linesOfCodeGenerator(tree, options);
    const linesOfCode = tree.read(
      `dist/metrics/${
        readProjectConfiguration(tree, 'testprojectA').root
      }/lines-of-code.json`
    );
    expect(linesOfCode).toBeTruthy();
  });

  it('should create lines-of-code.json file with correct content', async () => {
    await linesOfCodeGenerator(tree, options);
    const stats = readJson<{ total: number; files: { file: string; linesOfCode: number }[] }>(
      tree,
      `dist/metrics/${
        readProjectConfiguration(tree, 'testprojectA').root
      }/lines-of-code.json`
    )

    expect(stats.total).toBe(34);
  });
});
