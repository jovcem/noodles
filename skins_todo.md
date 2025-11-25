# Skins TODO

## Current State

Noodles currently **does not fully represent glTF skins**.

### What's Currently Implemented:
- Detects when nodes reference skins (`nodeExtractor.js:96-100`)
- Stores `skinId` reference on nodes (e.g., `"skin-0"`)
- Marks nodes as `'skinned-mesh'` subtype for filtering
- Shows skinned-mesh nodes with orange color in the graph

### What's Missing:
- No extraction of skin objects themselves
- No `skins` array in the extracted `sceneData` structure
- No visualization of joint hierarchy
- No display of skeleton structure
- No connection between skins and their joint nodes

## glTF Skin Structure

According to the [glTF 2.0 spec](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html), a Skin object contains:

```json
{
  "skins": [
    {
      "name": "Character_Skin",
      "joints": [1, 5, 6, 7, 8, 9, 10],        // Node indices (skeleton bones)
      "inverseBindMatrices": 12,               // Accessor index (matrix data)
      "skeleton": 1                            // (Optional) Root joint node index
    }
  ]
}
```

### Skin References:
1. **`joints`** - Array of node indices that form the skeleton hierarchy
2. **`inverseBindMatrices`** - Accessor index pointing to buffer data with 4x4 matrices
3. **`skeleton`** (optional) - Node index for the root joint
4. **`name`** (optional) - Skin name

### Data Chain:
```
Skin → joints[node indices] → Node objects
     → inverseBindMatrices(accessor) → Accessor → BufferView → Buffer (matrix data)
     → skeleton(node index) → Root joint node
```

## Artist Perspective

### What Artists Need to See:
- ✅ Joint/bone names (which nodes are in the skeleton)
- ✅ Joint hierarchy (parent-child relationships)
- ✅ Skeleton root node
- ✅ Which skin a mesh uses
- ✅ Number of joints in the rig

### What's Just Engine Data:
- ❌ Inverse bind matrix values (pre-computed during export, used for runtime calculations)
- These could be shown as metadata ("23 matrices") but don't need to display actual values

## Visualization Options

### Option 1: Integrate into Main Graph
Add skin nodes to the existing scene graph, connected to:
- Skinned meshes that use them
- Joint nodes they reference

**Pros:**
- Consistent with current material display
- Shows all relationships in one view

**Cons:**
- Could clutter graph with many joint connections (20-50+)

### Option 2: Separate Detail View (Recommended)
Follow the current material detail pattern:
- Show skins as nodes in main graph (new node type)
- Double-click skin → opens focused skeleton hierarchy view
- Similar to how materials show composition graph

**Pros:**
- Matches existing UI/UX pattern
- Keeps main graph clean
- Allows deep inspection when needed

**Cons:**
- Requires additional detail view implementation

### Option 3: Separate Tab/Panel
Add dedicated "Skeletons" view alongside node editor

**Pros:**
- Completely separate concern
- Could show all skins at once

**Cons:**
- Adds UI complexity
- Breaks from single-graph approach

## Implementation TODO

### 1. Data Extraction (`nodeExtractor.js`)

Add skin extraction to `extractSceneData()`:

```javascript
const sceneData = {
  nodes: [],
  meshes: [],
  materials: [],
  skins: [],  // ← Add this
};

// Extract skins
const allSkins = root.listSkins();
allSkins.forEach((skin, index) => {
  const skinData = {
    id: `skin-${index}`,
    name: skin.getName() || `Skin ${index}`,
    type: 'skin',
    joints: [], // Node IDs of joint nodes
    skeleton: null, // Node ID of root joint (optional)
    inverseBindMatricesCount: null, // Number of matrices (metadata)
  };

  // Extract joint node references
  const joints = skin.listJoints();
  joints.forEach((jointNode) => {
    const jointIndex = nodeIndexMap.get(jointNode);
    if (jointIndex !== undefined) {
      skinData.joints.push(`node-${jointIndex}`);
    }
  });

  // Extract skeleton root (optional)
  const skeleton = skin.getSkeleton();
  if (skeleton) {
    const skeletonIndex = nodeIndexMap.get(skeleton);
    if (skeletonIndex !== undefined) {
      skinData.skeleton = `node-${skeletonIndex}`;
    }
  }

  // Get inverse bind matrices count (metadata only)
  const inverseBindMatrices = skin.getInverseBindMatrices();
  if (inverseBindMatrices) {
    skinData.inverseBindMatricesCount = inverseBindMatrices.getCount();
  }

  sceneData.skins.push(skinData);
});
```

### 2. Graph Building

Choose visualization approach (see options above) and implement:
- Add skin node type to graph
- Create edges connecting skins to joints
- Create edges connecting meshes to skins

### 3. UI Components

Depending on chosen approach:
- Add skin node component (if using Option 2)
- Add skeleton detail view (if using Option 2)
- Add skin property pane
- Update color constants for skin nodes

### 4. Store Integration

Update `sceneStore.js` to handle skin data and selection

## References

- [glTF 2.0 Specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)
- [glTF Skin Schema](https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/schema/skin.schema.json)
- [glTF Tutorials - Skins](https://github.khronos.org/glTF-Tutorials/gltfTutorial/gltfTutorial_020_Skins.html)
- [Skeletal Animation in glTF](https://lisyarus.github.io/blog/posts/gltf-animation.html)

## Notes

- Visualization approach TBD (decide between Options 1, 2, or 3)
- Consider whether to show inverse bind matrices as debug info
- May want to highlight joint nodes differently in main graph (they're currently just regular nodes)
