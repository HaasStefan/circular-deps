import { readProjectConfiguration, Tree } from '@nx/devkit';

export function getFiles(
  tree: Tree,
  projectName: string,
  fileExtensions: string[]
): string[] {
  const sourceRoot = readProjectConfiguration(tree, projectName).sourceRoot;
  return getAllFilesInDirectory(tree, sourceRoot, fileExtensions);
}

function getAllFilesInDirectory(
  tree: Tree,
  directory: string,
  fileExtensions: string[]
): string[] {
  const children = tree.children(directory);
  const files: string[] = [];

  for (const child of children) {
    const path = `${directory}/${child}`;
    if (!tree.isFile(path)) {
      files.push(...getAllFilesInDirectory(tree, path, fileExtensions));
    } else if (fileExtensions.some((ext) => child.endsWith(`.${ext}`))) {
      files.push(path);
    }
  }

  return files;
}
