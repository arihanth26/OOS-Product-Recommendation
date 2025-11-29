# D3 Visualization React Integration

## Overview
The D3 visualizations have been integrated directly into the React application as components, eliminating the need for separate ports and avoiding navigation issues.

## What Changed

### 1. New React Component
- **File**: `src/components/D3HierarchicalGraph.tsx`
- Converts the standalone HTML D3 visualization into a React component
- Preserves all original functionality:
  - Interactive zoom/pan
  - Search by aisle/cluster/product
  - Click clusters to drill down into products
  - Fit view button
  - Force-directed layout for products

### 2. Updated VisualizationCTA
- **File**: `src/components/VisualizationCTA.tsx`
- Now renders the D3 component as a full-screen overlay
- No longer opens a new window
- Uses React state to toggle visualization visibility
- Includes confirmation dialog before opening

### 3. Data Files Copied
- JSON data files copied from `data/processed/` to `client/public/data/processed/`
- Files accessible via public URL path from React app
- Required files:
  - `drilldown_graph.json` (main hierarchical data)
  - `drilldown_graph_gmm.json` (GMM layout augmentation)

### 4. New Dependencies
```json
{
  "d3": "^7.x",
  "@types/d3": "^7.x"
}
```

## How It Works

1. User clicks "Open Visualization" button in the product detail page
2. Confirmation dialog appears
3. On "OK", React state updates to show `<D3HierarchicalGraph />`
4. Component renders as full-screen overlay
5. D3 loads JSON data from `/public/data/processed/`
6. All interactions work the same as the standalone HTML version
7. "Close" button in top-right corner dismisses the overlay

## Benefits

✅ **Single Port**: Everything runs on React dev server (default 5173)
✅ **No Navigation Issues**: Stays within the same application context
✅ **State Management**: React controls when visualization appears
✅ **Type Safety**: TypeScript types for D3 interactions
✅ **Cleaner UX**: Overlay modal instead of pop-up window

## Usage

```tsx
import { VisualizationCTA } from "./components/VisualizationCTA";

// In your component
<VisualizationCTA 
  onOpenVisualization={() => {
    // Optional: track analytics, show toast, etc.
  }}
/>
```

## Next Steps (Optional)

If you want to add the GMM layout as a separate component:
1. Create `D3GMMGraph.tsx` following the same pattern
2. Add a layout switcher in the D3 component's UI bar
3. Toggle between hierarchical and GMM views without page reload

## File Structure

```
client/
├── src/
│   └── components/
│       ├── D3HierarchicalGraph.tsx       # New: D3 React component
│       └── VisualizationCTA.tsx          # Updated: uses D3 component
├── public/
│   └── data/
│       └── processed/
│           ├── drilldown_graph.json      # Copied from ../data/
│           └── drilldown_graph_gmm.json  # Copied from ../data/
└── package.json                           # Added d3 dependencies
```

## Testing

1. Start the dev server:
   ```bash
   cd client
   npm run dev
   ```

2. Navigate to the product detail page

3. Scroll to the "View Clusters & Graphs" section

4. Click "Open Visualization"

5. Confirm the dialog

6. Interact with the graph:
   - Zoom with mouse wheel
   - Pan by dragging
   - Search for aisles/clusters/products
   - Click clusters to see product drilldown
   - Click "Fit View" to reset zoom
   - Click "Close" to dismiss

## Troubleshooting

**Problem**: JSON files not loading (404 errors)
- **Solution**: Ensure files were copied to `public/data/processed/`
- Run: `cp -r ../data/processed/*.json public/data/processed/`

**Problem**: D3 types not found
- **Solution**: Install dependencies
- Run: `npm install d3 @types/d3`

**Problem**: Visualization doesn't close
- **Solution**: Check that `onClose` prop is wired correctly in parent

**Problem**: Slow performance with many products
- **Solution**: The code already limits drilldown to 600 products; adjust in `renderProducts()` if needed
