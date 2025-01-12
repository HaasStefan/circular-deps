import { readProjectConfiguration, Tree } from '@nx/devkit';

export function getEntryPath(tree: Tree, project: string): string | null {
  const projectConfig = readProjectConfiguration(tree, project);
  const sourceRoot = projectConfig.sourceRoot;
  const tsconfigBase = tree.read('tsconfig.base.json', 'utf-8');
  const tsconfigBaseJson = JSON.parse(tsconfigBase);
  const paths: Record<string, string[]> =
    tsconfigBaseJson.compilerOptions.paths;

  for (const path of Object.values(paths)) {
    const entryFilePath = path.filter((p) => p.startsWith(sourceRoot));
    if (entryFilePath.length > 0) {
      return entryFilePath[0];
    }
  }

  return null;
}
