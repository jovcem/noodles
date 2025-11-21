import { create } from 'zustand'

export const useSceneStore = create((set) => ({
  // State
  currentModel: null,
  nodes: [],
  edges: [],
  sceneData: null,
  selectedNode: null,

  // Actions
  loadModel: (file) => set({ currentModel: file }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSceneData: (sceneData) => set({ sceneData }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
}))
