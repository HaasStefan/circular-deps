import { formatFiles, readProjectConfiguration, Tree } from '@nx/devkit';
import { SourceClustersGeneratorSchema } from './schema';
import { getSourceFiles } from './utils/ts-files';
import { getEntryPath } from './utils/entry-path';
import { createSourceTree } from './utils/source-tree';
import { clusterSourceTree } from './utils/clusters';

export async function sourceClustersGenerator(
  tree: Tree,
  options: SourceClustersGeneratorSchema
) {
  const sourceFiles = getSourceFiles(tree, options.projectName);
  const entryFilePath = getEntryPath(tree, options.projectName);
  const sourceTree = createSourceTree(tree, sourceFiles, entryFilePath);
  const clusters = clusterSourceTree(sourceTree);

  tree.write(
    `dist/${
      readProjectConfiguration(tree, options.projectName).root
    }/clusters.json`,
    JSON.stringify(clusters, null, 2)
  );

  await formatFiles(tree);

  return clusters;
}

export default sourceClustersGenerator;
