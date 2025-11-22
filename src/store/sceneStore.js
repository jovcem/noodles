import { create } from 'zustand'
import { cleanupBlobUrl } from '../utils/gltf/separator'

export const useSceneStore = create((set, get) => ({
  // State
  currentModel: null,
  current2DImage: null,
  nodes: [],
  edges: [],
  sceneData: null,
  selectedNode: null,
  isolationMode: false,
  isolatedMeshId: null,
  isolatedModelUrl: null,
  originalModelUrl: null,
  materialDetailMode: false,
  materialDetailData: null,
  viewerMode: '3d', // '2d' or '3d'

  // Actions
  loadModel: (file) => set({ currentModel: file }),
  load2DImage: (imageUrl) => set({ current2DImage: imageUrl }),
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

  // Material detail mode actions
  enterMaterialDetail: (materialData) => {
    set({
      materialDetailMode: true,
      materialDetailData: materialData,
    });
  },

  exitMaterialDetail: () => {
    set({
      materialDetailMode: false,
      materialDetailData: null,
    });
  },

  // Viewer mode actions
  setViewerMode: (mode) => set({ viewerMode: mode }),
}))
