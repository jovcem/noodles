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
  skinDetailMode: false,
  skinDetailData: null,
  viewerMode: '3d', // '2d' or '3d'
  isLoadingGraph: false,
  currentPlayingAnimation: null, // Name of currently playing animation
  modelViewerRef: null, // Reference to model-viewer element
  animationCurrentTime: 0, // Current playback position in seconds

  // Node filtering state (which subtypes to show)
  nodeFilters: {
    transform: true,
    empty: true,
    mesh: true,
    camera: true,
    'skinned-mesh': true,
    light: true,
  },

  // Actions
  loadModel: (file) => set({ currentModel: file }),
  load2DImage: (imageUrl) => set({ current2DImage: imageUrl }),
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSceneData: (sceneData) => set({ sceneData }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setIsLoadingGraph: (isLoadingGraph) => set({ isLoadingGraph }),

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

  // Skin detail mode actions
  enterSkinDetail: (skinData) => {
    set({
      skinDetailMode: true,
      skinDetailData: skinData,
    });
  },

  exitSkinDetail: () => {
    set({
      skinDetailMode: false,
      skinDetailData: null,
    });
  },

  // Viewer mode actions
  setViewerMode: (mode) => set({ viewerMode: mode }),

  // Node filter actions
  toggleNodeFilter: (subType) => set((state) => ({
    nodeFilters: {
      ...state.nodeFilters,
      [subType]: !state.nodeFilters[subType],
    },
  })),

  setNodeFilter: (subType, value) => set((state) => ({
    nodeFilters: {
      ...state.nodeFilters,
      [subType]: value,
    },
  })),

  showAllNodeTypes: () => set({
    nodeFilters: {
      transform: true,
      empty: true,
      mesh: true,
      camera: true,
      'skinned-mesh': true,
      light: true,
    },
  }),

  hideAllNodeTypes: () => set({
    nodeFilters: {
      transform: false,
      empty: false,
      mesh: false,
      camera: false,
      'skinned-mesh': false,
      light: false,
    },
  }),

  // Animation playback actions
  setModelViewerRef: (ref) => set({ modelViewerRef: ref }),

  playAnimation: (animationName) => {
    const modelViewerRef = get().modelViewerRef;
    if (modelViewerRef) {
      modelViewerRef.animationName = animationName;
      modelViewerRef.play();
      set({ currentPlayingAnimation: animationName });
    }
  },

  pauseAnimation: () => {
    const modelViewerRef = get().modelViewerRef;
    if (modelViewerRef) {
      modelViewerRef.pause();
      set({ currentPlayingAnimation: null });
    }
  },

  setAnimationCurrentTime: (time) => {
    set({ animationCurrentTime: time });
  },

  seekAnimation: (time) => {
    const modelViewerRef = get().modelViewerRef;
    if (!modelViewerRef) return;

    const wasPlaying = !modelViewerRef.paused;

    // Workaround: briefly play to enable seeking when paused
    if (!wasPlaying) {
      modelViewerRef.play();
    }

    modelViewerRef.currentTime = time;
    set({ animationCurrentTime: time });

    // Restore paused state after one frame
    if (!wasPlaying) {
      setTimeout(() => {
        modelViewerRef.pause();
      }, 16);
    }
  },

}))
