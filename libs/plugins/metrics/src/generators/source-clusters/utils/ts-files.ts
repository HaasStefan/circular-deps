import { readProjectConfiguration, Tree } from '@nx/devkit';
import { join } from 'path';
import * as ts from 'typescript';

export function getSourceFiles(tree: Tree, project: string): ts.SourceFile[] {
  const tsFiles = getTsFiles(tree, project);
  return tsFiles.map((tsFile) => {
    return ts.createSourceFile(
      tsFile,
      tree.read(tsFile, 'utf-8'),
      ts.ScriptTarget.Latest
    );
  });
}

function getTsFiles(tree: Tree, project: string): string[] {
  const projectConfig = readProjectConfiguration(tree, project);
  const sourceRoot = projectConfig.sourceRoot;
  const tsFiles = getTsFilesInDirectory(tree, sourceRoot);

  return tsFiles;
}

function getTsFilesInDirectory(tree: Tree, directory: string): string[] {
  const paths = tree.children(directory);

  const tsFiles: string[] = [];
  for (const path of paths.map((p) => join(directory, p))) {
    if (!tree.isFile(path)) {
      tsFiles.push(...getTsFilesInDirectory(tree, path));
    } else if (path.endsWith('.ts')) {
      tsFiles.push(path);
    }
  }

  return tsFiles;
}
