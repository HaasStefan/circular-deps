import {
  formatFiles,
  readProjectConfiguration,
  Tree,
  writeJson,
} from '@nx/devkit';
import { LinesOfCodeGeneratorSchema } from './schema';
import { getFiles } from './utils/get-files';

export async function linesOfCodeGenerator(
  tree: Tree,
  options: LinesOfCodeGeneratorSchema
) {
  const files = getFiles(tree, options.projectName, options.fileExtensions);
  const linesOfCode = files.map((file) => {
    const content = tree.read(file, 'utf-8');
    return {
      file,
      linesOfCode: content.split('\n').length,
    };
  });

  const stats = {
    total: linesOfCode.reduce((acc, curr) => acc + curr.linesOfCode, 0),
    files: linesOfCode,
  }

  writeJson(
    tree,
    `dist/metrics/${
      readProjectConfiguration(tree, options.projectName).root
    }/lines-of-code.json`,
    stats
  );

  await formatFiles(tree);
}

export default linesOfCodeGenerator;
