import { parseGLB } from './parser.js';
import { extractSceneData } from './nodeExtractor.js';
import { buildReactFlowGraph } from '../graph/graphBuilder.js';

export async function glbToNodes(glbFile) {
  try {
    const document = await parseGLB(glbFile);

    const sceneData = extractSceneData(document);

    const graph = buildReactFlowGraph(sceneData);

    return {
      ...graph,
      sceneData,
    };
  } catch (error) {
    console.error('Error converting GLB to nodes:', error);
    return {
      nodes: [],
      edges: [],
      sceneData: null,
    };
  }
}
