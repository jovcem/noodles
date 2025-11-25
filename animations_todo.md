# Animations TODO

## Current State

Noodles currently **does not extract or visualize animations at all**.

### What's Missing:
- No animation extraction code
- No `animations` array in the extracted `sceneData` structure
- No visualization of animation data
- No display of channels, samplers, or keyframes
- No indication of which nodes are animated

```javascript
// nodeExtractor.js:44-48 - Current structure
const sceneData = {
  nodes: [],
  meshes: [],
  materials: [],
  // ❌ animations: [] is missing!
};
```

## glTF Animation Structure

According to the [glTF 2.0 spec](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html), animations describe how node properties change over time.

### Components Hierarchy:

```
Animation
├─ name (optional)                      // e.g., "Walk_Cycle", "Idle", "Jump"
├─ Channels[]                           // What gets animated
│  ├─ sampler (index)                  // Which sampler to use
│  └─ target
│     ├─ node (index)                  // Which node to animate
│     └─ path (property)               // "translation", "rotation", "scale", "weights"
│
└─ Samplers[]                           // Keyframe data
   ├─ input (accessor index)           // Timestamps (in seconds)
   ├─ output (accessor index)          // Values (vec3/vec4/etc)
   └─ interpolation                    // "LINEAR", "STEP", "CUBICSPLINE"
```

### Data Flow:

```
Animation
    └─→ Channel (defines WHAT to animate)
        ├─→ Target: Node + Property path
        └─→ Sampler (defines HOW to animate)
            ├─→ Input Accessor → Buffer (timestamps)
            ├─→ Output Accessor → Buffer (values)
            └─→ Interpolation type
```

### Example JSON Structure:

```json
{
  "animations": [
    {
      "name": "Walk_Cycle",
      "channels": [
        {
          "sampler": 0,
          "target": {
            "node": 5,
            "path": "translation"
          }
        },
        {
          "sampler": 1,
          "target": {
            "node": 5,
            "path": "rotation"
          }
        },
        {
          "sampler": 2,
          "target": {
            "node": 6,
            "path": "rotation"
          }
        }
      ],
      "samplers": [
        {
          "input": 10,    // Accessor: [0.0, 0.5, 1.0, 1.5] (times in seconds)
          "output": 11,   // Accessor: [[0,0,0], [0,1,0], ...] (positions)
          "interpolation": "LINEAR"
        },
        {
          "input": 10,    // Same times as sampler 0
          "output": 12,   // Different values (quaternion rotations)
          "interpolation": "LINEAR"
        },
        {
          "input": 13,    // Different times
          "output": 14,   // Different values
          "interpolation": "CUBICSPLINE"
        }
      ]
    }
  ]
}
```

## Animation Components Detail

### Channels
- Each channel animates **one property** of **one node**
- Multiple channels can target the same node (e.g., translation + rotation)
- **Target properties (path values):**
  - `"translation"` - Position (vec3)
  - `"rotation"` - Orientation (vec4 quaternion)
  - `"scale"` - Scale (vec3)
  - `"weights"` - Morph target weights (array of floats)

### Samplers
- Provide keyframe data for interpolation
- **Input**: Accessor containing timestamps (scalar floats, in seconds)
  - Must be sorted in ascending order
  - First timestamp should be >= 0.0
- **Output**: Accessor containing values (type depends on path)
  - Translation/Scale: vec3 arrays
  - Rotation: vec4 quaternion arrays
  - Weights: float arrays
- **Interpolation modes:**
  - `STEP`: Discrete jumps (no blending)
  - `LINEAR`: Linear interpolation (lerp for vectors, slerp for rotations)
  - `CUBICSPLINE`: Hermite spline with tangents (requires 3x data: in-tangent, value, out-tangent)

### Accessors
- Reference buffer data containing actual timestamps and values
- Input accessor: timestamps (scalar floats)
- Output accessor: values (type varies by property path)

## Artist Perspective

### What Artists Need to See:

**Essential info:**
- ✅ Animation names
- ✅ Which nodes are animated
- ✅ What properties are animated (translation/rotation/scale/weights)
- ✅ Number of keyframes per channel
- ✅ Animation duration (time range)
- ✅ Interpolation type per channel

**Nice to have:**
- Keyframe timestamps distribution
- Shared samplers indicator (multiple channels using same sampler)
- Multiple animations indicator

**Don't need:**
- Raw buffer data values
- Individual keyframe values (unless debugging)
- Accessor technical details

## Complexity Consideration: Is Full Detail Too Technical?

### The Question
While the sampler→channel→target flow is **technically accurate** to the glTF spec, it may be **over-engineered for artist needs**.

### What Artists REALLY Care About
When inspecting a glTF file, artists typically just need:

1. ✅ **"What animations exist?"** - Names and count
2. ✅ **"How long are they?"** - Duration
3. ✅ **"What's moving?"** - Which bones/nodes
4. ✅ **"What properties are animated?"** - Translation, rotation, scale
5. ⚠️ **"Is it smooth or stepped?"** - Interpolation type (maybe, if debugging quality)

### What They Probably DON'T Need
- ❌ Sampler vs channel distinction (too technical)
- ❌ Accessor indices (implementation detail)
- ❌ Input/output accessor references
- ❌ Separate sampler nodes in a graph

### User Type Consideration
The right approach depends on your target users:

- **Scenario A: Regular Artists** - "What's in this file?"
  - Simple property panel with list of animated nodes
  - Minimal visual noise

- **Scenario B: Technical Artists** - "Why isn't this animation working?"
  - Full sampler→channel→target graph
  - All technical details visible

**For most artists, Scenario A is sufficient.**

## Visualization Options for Node View

### Artist-Focused Options (Simpler)

#### Option A: Property Panel Only (Minimal - Recommended for Artists)

**Main graph:** Show animation nodes with edges to animated nodes
**Property panel** when animation selected shows everything:

```
Animation: Walk_Cycle
Duration: 2.5s
Channels: 7

Animated Nodes:
├─ Root
│  ├─ translation (LINEAR, 15 keys)
│  └─ rotation (LINEAR, 15 keys)
├─ Spine
│  └─ rotation (LINEAR, 12 keys)
├─ LeftLeg
│  └─ rotation (SMOOTH, 8 keys)
├─ RightLeg
│  └─ rotation (SMOOTH, 8 keys)
├─ LeftFoot
│  └─ rotation (LINEAR, 10 keys)
└─ RightFoot
   └─ rotation (LINEAR, 10 keys)
```

**Pros:**
- Clean and simple
- All essential info visible
- No separate view needed
- Easy to scan
- Fast to implement

**Cons:**
- Not very visual
- Just text in panel

---

#### Option B: Simple Visual Graph (Simplified Detail View)

Skip samplers entirely, just show animated properties:

```
┌────────────────────────────────────────────┐
│  Animation: "Walk_Cycle" (2.5s)            │
├────────────────────────────────────────────┤
│                                            │
│  ┌─────────────────┐    ┌──────────────┐  │
│  │ Root            │    │ translation  │  │
│  │ node-5          │◄───│ LINEAR       │  │
│  │                 │    │ 15 keys      │  │
│  │                 │    └──────────────┘  │
│  │                 │                       │
│  │                 │    ┌──────────────┐  │
│  │                 │◄───│ rotation     │  │
│  │                 │    │ LINEAR       │  │
│  └─────────────────┘    │ 15 keys      │  │
│                         └──────────────┘  │
│                                            │
│  ┌─────────────────┐    ┌──────────────┐  │
│  │ Spine           │    │ rotation     │  │
│  │ node-6          │◄───│ LINEAR       │  │
│  │                 │    │ 12 keys      │  │
│  └─────────────────┘    └──────────────┘  │
└────────────────────────────────────────────┘
```

**Just 2 columns:**
- Node being animated (left)
- Property + interpolation (right)
- No sampler nodes

**Pros:**
- Visual but simpler than full detail
- Shows the essentials artists care about
- Matches "what's animated" mental model

**Cons:**
- Still requires detail view implementation
- More work than Option A

---

#### Option C: Inline Annotation (Ultra Minimal)

No separate view at all - show in main graph only:

```
Main Graph:

[Animation: Walk_Cycle]
     ├──► [Root] ⚡(trans + rot)
     ├──► [Spine] ⚡(rot)
     ├──► [LeftLeg] ⚡(rot)
     ├──► [RightLeg] ⚡(rot)
     ├──► [LeftFoot] ⚡(rot)
     └──► [RightFoot] ⚡(rot)
```

- Animated nodes get ⚡ badge
- Edge tooltip shows properties
- Property panel shows basic info

**Pros:**
- Zero extra UI
- Everything in main graph
- Minimal implementation

**Cons:**
- Can clutter main graph with many animations
- Limited detail visibility
- Hard to see interpolation types

---

### Technical Options (More Complex)

These options show the full glTF structure but may be overkill for most artists.

#### Option 1: Animation Nodes in Main Graph

Add animation nodes directly to the scene graph with connections to animated nodes.

```
[Animation: "Walk_Cycle"]
    ├─→ [Node: "Root" (node-5)] (translation, rotation)
    ├─→ [Node: "Spine" (node-6)] (rotation)
    └─→ [Node: "Hand" (node-12)] (scale)
```

**Implementation:**
- One animation node per animation
- Edges to each animated node
- Edge labels or tooltips show animated properties

**Pros:**
- Shows which nodes are animated at a glance
- Integrated into main scene graph
- Simple to understand

**Cons:**
- Could clutter graph with many animations/channels
- Doesn't show sampler/interpolation details
- Multiple channels per node might create edge overlap

### Option 2: Detailed Animation Graph (Recommended)

Follow the material detail view pattern - show animations in main graph, double-click for detail.

**Main Graph:**
```
[Animation: "Walk_Cycle"] ─→ (edges to animated nodes)
                 ↑
         (double-click to see detail)
```

**Detail View:**
```
[Sampler 0]                         [Channel 0]
  Input: accessor-10                   └─→ Target: Node-5 (Root)
  Output: accessor-11                       Property: translation
  Interpolation: LINEAR                     Keyframes: 15
  Duration: 2.5s
                    └──────→ [Channel Connection]

[Sampler 1]                         [Channel 1]
  Input: accessor-10                   └─→ Target: Node-5 (Root)
  Output: accessor-12                       Property: rotation
  Interpolation: LINEAR                     Keyframes: 15

[Sampler 2]                         [Channel 2]
  Input: accessor-13                   └─→ Target: Node-6 (Spine)
  Output: accessor-14                       Property: rotation
  Interpolation: CUBICSPLINE               Keyframes: 8
```

**Pros:**
- Consistent with existing material detail pattern
- Shows complete data flow: sampler → channel → target
- Keeps main graph clean
- Can display all technical details (interpolation, keyframes, duration)
- Highlights shared samplers (multiple channels using same sampler)

**Cons:**
- Requires separate detail view implementation
- Extra click to see details

### Option 3: Timeline/Curve View

Separate panel with traditional animation timeline interface.

```
Animation: "Walk_Cycle" (Duration: 2.5s)
─────────────────────────────────────────────────
Timeline    0.0s    0.5s    1.0s    1.5s    2.0s    2.5s
            │       │       │       │       │       │
Root.trans  ●───────●───────●───────●───────●───────● (LINEAR, 15 keys)
Root.rot    ●───────●───────●───────●───────●───────● (LINEAR, 15 keys)
Spine.rot   ●───────●───────●───────●───────●───────● (CUBICSPLINE, 8 keys)
Hand.scale  ●───────●───────●───────────────────────● (STEP, 3 keys)
```

**Pros:**
- Familiar to artists (like Blender/Maya/3DS Max)
- Shows temporal relationships clearly
- Visualizes keyframe distribution
- Easy to see animation length and density

**Cons:**
- Different paradigm from node-based view
- More complex UI (timeline scrubbing, zoom, etc.)
- Doesn't fit Noodles' current node-graph approach
- Higher implementation effort

### Option 4: Hybrid Node + Metadata Panel

Simplified animation nodes with details in the property panel.

**Main Graph:**
```
[Animation: "Walk_Cycle"] ─→ connects to animated nodes
```

**Property Panel (when animation selected):**
```
Animation: Walk_Cycle
Duration: 2.5s
Total Channels: 12
Total Samplers: 8

Channels:
├─ Channel 0
│  ├─ Target: Root (node-5) - translation
│  ├─ Sampler: 0 (LINEAR)
│  └─ Keyframes: 15
├─ Channel 1
│  ├─ Target: Root (node-5) - rotation
│  ├─ Sampler: 1 (LINEAR)
│  └─ Keyframes: 15
├─ Channel 2
│  ├─ Target: Spine (node-6) - rotation
│  ├─ Sampler: 2 (CUBICSPLINE)
│  └─ Keyframes: 8
└─ ...

Samplers:
├─ Sampler 0: LINEAR, input: accessor-10, output: accessor-11
├─ Sampler 1: LINEAR, input: accessor-10, output: accessor-12
└─ ...
```

**Pros:**
- Minimal graph clutter
- Uses existing property panel pattern
- Easy to implement
- All info accessible

**Cons:**
- Less visual than dedicated graph view
- No sampler→channel relationship visualization
- Lots of text, less graphical

## Updated Recommendation

### For Artist-Focused Tool: Option A (Property Panel Only)

**Recommended approach for most users:**

1. **Main graph**: Show animation nodes (new colored type) with edges to animated nodes
2. **Visual indicator**: Badge on animated nodes (⚡ icon)
3. **Property panel**: When animation selected, show simple grouped list (no separate view needed)
4. **Interaction**: Click node ID in property panel to jump to that node in main graph

**Why this approach:**
- ✅ Fast to implement (no new views)
- ✅ All essential info visible
- ✅ Not overwhelming with technical details
- ✅ Fits existing property panel pattern
- ✅ Minimal graph clutter
- ✅ Artists get exactly what they need: "what's in this file?"

**Implementation effort:** Low - just data extraction + property panel component

---

### Alternative: For Technical Artists

If your users need to **debug animation issues** or understand the **full glTF structure**, consider:

**Option B (Simplified Visual Graph)** - Shows node→property connections without sampler detail

OR

**Option 2 (Full Detail Graph)** - Shows complete sampler→channel→target flow

**Both require:** Separate detail view implementation (higher effort)

---

### Decision Guide

Choose based on your primary use case:

| Use Case | Recommended Option | Rationale |
|----------|-------------------|-----------|
| "What animations are in this GLB?" | **Option A (Panel)** | Simple inspection |
| "Which bones move in this animation?" | **Option A (Panel)** | Quick reference |
| "Why is this animation jerky?" | **Option B or 2** | Need interpolation details |
| "Why isn't this sampler being used?" | **Option 2 (Full Detail)** | Need full glTF structure |
| "General model inspection tool" | **Option A (Panel)** | Broad audience |

**For Noodles as a glTF inspection tool for artists: Option A is recommended.**

## Implementation TODO

### For Option A (Simplified - Recommended)

#### 1. Data Extraction (`nodeExtractor.js`)

```javascript
const sceneData = {
  nodes: [],
  meshes: [],
  materials: [],
  animations: [],  // ← Add this
};

// Extract animations
const allAnimations = root.listAnimations();
allAnimations.forEach((animation, index) => {
  const animationData = {
    id: `animation-${index}`,
    name: animation.getName() || `Animation ${index}`,
    type: 'animation',
    duration: 0,
    animatedNodes: new Map(), // Map of nodeId → [properties]
  };

  // Extract channels and group by target node
  const channelsList = animation.listChannels();
  channelsList.forEach((channel) => {
    const targetNode = channel.getTargetNode();
    const targetPath = channel.getTargetPath();
    const sampler = channel.getSampler();

    if (!targetNode) return;

    const nodeId = `node-${nodeIndexMap.get(targetNode)}`;
    const nodeName = targetNode.getName() || nodeId;

    // Get keyframe count and interpolation from sampler
    const inputAccessor = sampler?.getInput();
    const interpolation = sampler?.getInterpolation() || 'LINEAR';
    const keyframeCount = inputAccessor ? inputAccessor.getCount() : 0;

    // Calculate duration
    if (inputAccessor && inputAccessor.getCount() > 0) {
      const times = [];
      for (let i = 0; i < inputAccessor.getCount(); i++) {
        times.push(inputAccessor.getScalar(i));
      }
      const maxTime = Math.max(...times);
      if (maxTime > animationData.duration) {
        animationData.duration = maxTime;
      }
    }

    // Group by node
    if (!animationData.animatedNodes.has(nodeId)) {
      animationData.animatedNodes.set(nodeId, {
        nodeId,
        nodeName,
        properties: []
      });
    }

    animationData.animatedNodes.get(nodeId).properties.push({
      path: targetPath, // "translation", "rotation", "scale", "weights"
      interpolation,
      keyframeCount,
    });
  });

  // Convert Map to array for easier consumption
  animationData.animatedNodes = Array.from(animationData.animatedNodes.values());

  sceneData.animations.push(animationData);
});
```

#### 2. Graph Building (`graphBuilder.js`)

- Add animation nodes to main graph
- Create edges from animation nodes to target nodes
- Color-code animation nodes (e.g., purple/pink)

#### 3. UI Components

**Simple additions needed:**

- `components/node-editor/AnimationNode.jsx` - Animation node in main graph
- `components/propertyPane/AnimationProperties.jsx` - Property panel display

**AnimationProperties.jsx structure:**
```jsx
{
  name: "Walk_Cycle",
  duration: 2.5,
  animatedNodes: [
    {
      nodeId: "node-5",
      nodeName: "Root",
      properties: [
        { path: "translation", interpolation: "LINEAR", keyframeCount: 15 },
        { path: "rotation", interpolation: "LINEAR", keyframeCount: 15 }
      ]
    },
    // ...
  ]
}
```

#### 4. Store Integration

Update `sceneStore.js`:
- Add animations to state
- Add animation filter controls (show/hide animation nodes)

#### 5. Visual Indicators

Optional: Add badge/icon to animated nodes in main graph

**Total implementation effort: ~2-3 hours**

---

### For Option 2/Full Detail (Advanced)

#### 1. Data Extraction (`nodeExtractor.js`)

```javascript
const sceneData = {
  nodes: [],
  meshes: [],
  materials: [],
  animations: [],  // ← Add this
};

// Extract animations
const allAnimations = root.listAnimations();
allAnimations.forEach((animation, index) => {
  const animationData = {
    id: `animation-${index}`,
    name: animation.getName() || `Animation ${index}`,
    type: 'animation',
    channels: [],
    samplers: [],
    duration: 0,
  };

  // Extract samplers
  const samplersList = animation.listSamplers();
  samplersList.forEach((sampler, samplerIndex) => {
    const inputAccessor = sampler.getInput();
    const outputAccessor = sampler.getOutput();

    const samplerData = {
      id: `sampler-${index}-${samplerIndex}`,
      interpolation: sampler.getInterpolation(),
      inputAccessor: inputAccessor ? `accessor-${root.listAccessors().indexOf(inputAccessor)}` : null,
      outputAccessor: outputAccessor ? `accessor-${root.listAccessors().indexOf(outputAccessor)}` : null,
      keyframeCount: inputAccessor ? inputAccessor.getCount() : 0,
    };

    // Calculate duration from input accessor (timestamps)
    if (inputAccessor && inputAccessor.getCount() > 0) {
      const times = [];
      for (let i = 0; i < inputAccessor.getCount(); i++) {
        const time = inputAccessor.getScalar(i);
        times.push(time);
      }
      const maxTime = Math.max(...times);
      if (maxTime > animationData.duration) {
        animationData.duration = maxTime;
      }
    }

    animationData.samplers.push(samplerData);
  });

  // Extract channels
  const channelsList = animation.listChannels();
  channelsList.forEach((channel, channelIndex) => {
    const targetNode = channel.getTargetNode();
    const targetPath = channel.getTargetPath();
    const samplerRef = channel.getSampler();

    const channelData = {
      id: `channel-${index}-${channelIndex}`,
      targetNode: targetNode ? `node-${nodeIndexMap.get(targetNode)}` : null,
      targetPath: targetPath, // "translation", "rotation", "scale", "weights"
      samplerIndex: samplersList.indexOf(samplerRef),
      samplerId: samplerRef ? `sampler-${index}-${samplersList.indexOf(samplerRef)}` : null,
    };

    animationData.channels.push(channelData);
  });

  sceneData.animations.push(animationData);
});
```

### 2. Graph Building

#### Main Graph (`graphBuilder.js`)

- Add animation nodes to main graph
- Create edges from animations to target nodes
- Color-code animation nodes

#### Detail Graph (`animationGraphBuilder.js` - new file)

- Build sampler nodes (left column)
- Build channel nodes (middle column)
- Build target info nodes (right column)
- Create edges: sampler → channel → target

### 3. UI Components

**New components needed:**

- `components/node-editor/animation-nodes/`
  - `AnimationNode.jsx` - Animation node in main graph
  - `SamplerNode.jsx` - Sampler display in detail view
  - `ChannelNode.jsx` - Channel connection node
  - `AnimationDetailView.jsx` - Detail graph container

**Property pane:**
- `components/propertyPane/AnimationProperties.jsx`

**Color constants:**
- Add animation node colors to `themeConfig.js`

### 4. Store Integration

Update `sceneStore.js`:
- Add animations to state
- Add `selectedAnimation` for detail view
- Add animation filter controls

### 5. Node Type Registration

Register new ReactFlow node types:
- `animation` (main graph)
- `sampler` (detail view)
- `channel` (detail view)

## References

- [glTF Animations Tutorial](https://github.khronos.org/glTF-Tutorials/gltfTutorial/gltfTutorial_007_Animations.html)
- [glTF 2.0 Specification](https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html)
- [Animation Schema](https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/schema/animation.schema.json)
- [Animation Sampler Schema](https://github.com/KhronosGroup/glTF/blob/main/specification/2.0/schema/animation.sampler.schema.json)
- [Skeletal Animation in glTF](https://lisyarus.github.io/blog/posts/gltf-animation.html)

## Notes

- **Recommended approach: Option A (Property Panel)** - Simple, artist-focused, fast to implement
- Alternative for technical users: Option 2 (Full Detail Graph) - shows complete glTF structure
- Consider showing animation playback controls in future iterations (out of scope for inspection tool)
- May want to add ⚡ badge to animated nodes in main graph for visual indication
- Accessor data (raw keyframe values) not needed for artist use case
- Multiple animations in one file are common - list them all in the graph
- Interpolation types can be simplified: "LINEAR" → "Smooth", "STEP" → "Stepped", "CUBICSPLINE" → "Smooth"
- Future enhancement: Timeline view (Option 3) for advanced animation debugging
