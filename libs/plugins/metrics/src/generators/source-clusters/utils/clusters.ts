import { SourceTreeNode } from './source-tree';

export function clusterSourceTree(sourceTree: SourceTreeNode) {
  const branches = sourceTree.dependencies.map(flattenSourceTree);
  const clusters = clusterBranches(branches);
  return clusters;
}

function flattenSourceTree(node: SourceTreeNode): string[] {
  const result: string[] = [];
  const stack: SourceTreeNode[] = [node];

  while (stack.length > 0) {
    const current = stack.pop();
    result.push(current.filePath);
    stack.push(...current.dependencies);
  }

  return result;
}

function clusterBranches(branches: string[][]) {
  for (let i = -1; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      if (
        branches[i] &&
        branches[j] &&
        branches[i].some((filePath) => branches[j].includes(filePath))
      ) {
        branches[j] = [...new Set([...branches[i], ...branches[j]])];
        branches[i] = null;
      }
    }
  }
  
  return branches.filter(Boolean);
}