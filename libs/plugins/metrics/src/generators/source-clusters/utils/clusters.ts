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

function clusterBranches2(branches: string[][]) {
  const clusters: string[][] = [];

  for (const branch of branches) {
    const cluster = clusters.filter((c) =>
      c.some((filePath) => branch.includes(filePath))
    );

    if (cluster.length === 0) {
      clusters.push(branch);
    } else if (cluster.length === 1) {
      clusters.push(branch);
    } else {
      const indices = cluster.map((c) => clusters.indexOf(c));
      const newCluster: string[] = [];
      for (const index of indices) {
        newCluster.push(...clusters.splice(index, 1).flat());
      }
      clusters.push(newCluster);
    }
  }

  return clusters;
}
