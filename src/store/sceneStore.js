import { create } from 'zustand'
import { cleanupBlobUrl } from '../utils/gltf/separator'

export const useSceneStore = create((set, get) => ({
  // State
  currentModel: null,
  nodes: [],
  edges: [],
  sceneData: null,
  selectedNode: null,
  isolationMode: false,
  isolatedMeshId: null,
  isolatedModelUrl: null,
  originalModelUrl: null,

  // Actions
  loadModel: (file) => set({ currentModel: file }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSceneData: (sceneData) => set({ sceneData }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),

  // Isolation mode actions
  setIsolationMode: (meshId, isolatedBlobUrl) => {
    const currentModel = get().currentModel;
    set({
      isolationMode: true,
      isolatedMeshId: meshId,
      isolatedModelUrl: isolatedBlobUrl,
      originalModelUrl: currentModel,
    });
  },

  exitIsolationMode: () => {
    const isolatedModelUrl = get().isolatedModelUrl;

    // Cleanup the isolated blob URL to prevent memory leaks
    if (isolatedModelUrl) {
      cleanupBlobUrl(isolatedModelUrl);
    }

    set({
      isolationMode: false,
      isolatedMeshId: null,
      isolatedModelUrl: null,
      originalModelUrl: null,
    });
  },
}))
