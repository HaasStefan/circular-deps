import { Tree } from '@nx/devkit';
import { join } from 'path';
import * as ts from 'typescript';

export type SourceTreeNode = {
  filePath: string;
  dependencies: SourceTreeNode[];
};

export function createSourceTree(
  tree: Tree,
  sourceFiles: ts.SourceFile[],
  entryFilePath: string
): SourceTreeNode {
  const entrySourceFile = sourceFiles.find((sf) =>
    sf.fileName.includes(entryFilePath)
  );
  const root: SourceTreeNode = {
    filePath: entrySourceFile.fileName,
    dependencies: getDependencies(tree, entrySourceFile, sourceFiles),
  };

  return root;
}

function getDependencies(
  tree: Tree,
  sourceFile: ts.SourceFile,
  sourceFiles: ts.SourceFile[],
): SourceTreeNode[] | null {
  const importDeclarations = sourceFile.statements.filter(
    ts.isImportDeclaration
  );
  const exportDeclarations = sourceFile.statements.filter(
    ts.isExportDeclaration
  );

  const modules = [...importDeclarations, ...exportDeclarations].map(
    (declaration) =>
      ts.isStringLiteral(declaration.moduleSpecifier)
        ? declaration.moduleSpecifier.text
        : null
  );

  const currentDirectory = sourceFile.fileName.replace(/\/[^/]+$/, '');
  const dependencies: SourceTreeNode[] = [];
  for (const module of modules) {
    const isInternalPath = module?.startsWith('.');

    if (isInternalPath) {
      const dependencyPath = join(currentDirectory, `${module}.ts`);
      const dependencySourceFile= sourceFiles.find((sf) =>
        sf.fileName.includes(dependencyPath)
      );
      if (!dependencySourceFile) {
        throw new Error(`Could not find source file for ${dependencyPath}`);
      }

      dependencies.push({
        filePath: dependencySourceFile.fileName,
        dependencies: getDependencies(
          tree,
          dependencySourceFile,
          sourceFiles
        ),
      });
    } 
  }

  return dependencies;
}
