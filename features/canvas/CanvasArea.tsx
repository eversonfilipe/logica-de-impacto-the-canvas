import React, { useState, useCallback, useRef } from 'react';
import type { CanvasObject, Tool, DrawingObject } from '../../types';
import CanvasObjectWrapper from './CanvasObjectWrapper';
import { STICKY_NOTE_COLORS, SHAPE_COLORS } from '../../constants';

interface CanvasAreaProps {
  objects: CanvasObject[];
  onUpdateObject: (id: string, newObjectData: Partial<CanvasObject>) => void;
  onAddObject: (object: CanvasObject) => void;
  onDeleteObject: (id: string) => void;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  activeTool: Tool;
}

// Defines the state for a shape-based object being created via drag-and-drop
interface CreationState {
    start: { x: number; y: number };
    current: { x: number; y: number };
}

// Converts an array of points into an SVG path string.
function pointsToPath(points: {x: number, y: number}[]): string {
    if (points.length < 2) return "";
    const pathParts = points.map((p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        return `L ${p.x} ${p.y}`;
    });
    return pathParts.join(' ');
}


const CanvasArea: React.FC<CanvasAreaProps> = ({ 
  objects, onUpdateObject, onAddObject, onDeleteObject, 
  selectedObjectId, setSelectedObjectId, activeTool 
}) => {
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [creationState, setCreationState] = useState<CreationState | null>(null);
  // State specifically for handling the path of a freehand drawing in progress.
  const [drawingPoints, setDrawingPoints] = useState<{x: number, y: number}[] | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Translates screen coordinates (e.g., from a mouse event) to canvas coordinates
  const getCanvasCoordinates = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewport.x) / viewport.scale;
    const y = (e.clientY - rect.top - viewport.y) / viewport.scale;
    return { x, y };
  };

  // Handles mouse wheel events for zooming in and out of the canvas
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.1, viewport.scale + scaleAmount), 5);
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom towards the mouse cursor
    const newX = mouseX - (mouseX - viewport.x) * (newScale / viewport.scale);
    const newY = mouseY - (mouseY - viewport.y) * (newScale / viewport.scale);

    setViewport({ x: newX, y: newY, scale: newScale });
  };
  
  // Handles mouse down events on the canvas
  const handleMouseDown = (e: React.MouseEvent) => {
      // Ignore if the click is not directly on the canvas background
      if (e.target !== canvasRef.current) return;

      const coords = getCanvasCoordinates(e);

      if (activeTool === 'select') {
          // If in select mode, initiate panning
          setPanStart({ x: e.clientX, y: e.clientY });
          setSelectedObjectId(null); // Deselect any object when clicking canvas
      } else if (activeTool === 'draw') {
          // If the drawing tool is active, start collecting points for a new path.
          setDrawingPoints([coords]);
      }
      else {
          // For all other tools (shapes, text, sticky), begin creating a new object.
          setCreationState({ start: coords, current: coords });
      }
  };

  // Handles mouse movement across the canvas
  const handleMouseMove = (e: React.MouseEvent) => {
    // If panning, update the viewport position
    if (panStart) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setViewport(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
    // If drawing, add the new coordinate to the path.
    if (drawingPoints) {
        setDrawingPoints([...drawingPoints, getCanvasCoordinates(e)]);
    }
    // If creating a shape, update its current dimensions for the preview
    if (creationState) {
        setCreationState({ ...creationState, current: getCanvasCoordinates(e) });
    }
  };
  
  // Handles mouse up events, finalizing panning or object creation
  const handleMouseUp = () => {
    // Finalize freehand drawing
    if (drawingPoints && drawingPoints.length > 1) {
        // 1. Calculate the bounding box of the drawn path.
        const minX = Math.min(...drawingPoints.map(p => p.x));
        const minY = Math.min(...drawingPoints.map(p => p.y));
        const maxX = Math.max(...drawingPoints.map(p => p.x));
        const maxY = Math.max(...drawingPoints.map(p => p.y));

        // 2. Normalize points to be relative to the top-left of the bounding box.
        const normalizedPoints = drawingPoints.map(p => ({ x: p.x - minX, y: p.y - minY }));

        // 3. Create the new DrawingObject.
        const newObject: DrawingObject = {
            id: `obj-${Date.now()}`,
            type: 'draw',
            position: { x: minX, y: minY },
            size: { width: maxX - minX, height: maxY - minY },
            data: {
                points: normalizedPoints,
                stroke: SHAPE_COLORS.stroke,
                strokeWidth: 2,
            },
        };
        onAddObject(newObject);
    }
    // Finalize shape/text/sticky creation
    if (creationState) {
        const { start, current } = creationState;
        const width = Math.abs(current.x - start.x);
        const height = Math.abs(current.y - start.y);
        
        // Only create if the shape is larger than a few pixels (not a misclick)
        if (width > 5 || height > 5) {
            let newObject: Omit<CanvasObject, 'id'>;
            const baseProperties = {
                position: {
                    x: Math.min(start.x, current.x),
                    y: Math.min(start.y, current.y),
                },
                size: { width, height },
            };
            
            switch (activeTool) {
                case 'sticky':
                    newObject = { ...baseProperties, type: 'sticky', data: { text: '', color: STICKY_NOTE_COLORS[0]} };
                    break;
                case 'text':
                    newObject = { ...baseProperties, type: 'text', data: { text: '', color: '#333333', fontSize: 24 } };
                    break;
                case 'rectangle':
                case 'ellipse':
                case 'arrow':
                     newObject = { ...baseProperties, type: 'shape', data: { shape: activeTool, color: SHAPE_COLORS.fill, stroke: SHAPE_COLORS.stroke, strokeWidth: 2 } };
                     break;
                default:
                    setPanStart(null); setCreationState(null); return;
            }

            onAddObject({ ...newObject, id: `obj-${Date.now()}` } as CanvasObject);
        } else if (activeTool === 'text' || activeTool === 'sticky') {
            // Handle creating text/sticky with a single click (no drag)
            const defaultSize = activeTool === 'text' ? {width: 150, height: 50} : {width: 200, height: 150};
            const newObject = {
                id: `obj-${Date.now()}`,
                position: start,
                size: defaultSize,
                type: activeTool,
                data: activeTool === 'sticky' 
                    ? { text: '', color: STICKY_NOTE_COLORS[0] } 
                    : { text: '', color: '#333333', fontSize: 24 }
            };
            onAddObject(newObject as CanvasObject);
        }
    }
    
    // Reset all creation states
    setPanStart(null);
    setCreationState(null);
    setDrawingPoints(null);
  };

  // Renders a temporary preview of the object being created
  const renderCreationPreview = () => {
    // Preview for shapes/text/sticky
    if (creationState) {
        const { start, current } = creationState;
        const rect = {
            left: Math.min(start.x, current.x),
            top: Math.min(start.y, current.y),
            width: Math.abs(start.x - current.x),
            height: Math.abs(start.y - current.y),
        };
        return (
          <div
            className="absolute border-2 border-dashed border-blue-500 bg-blue-500 bg-opacity-10"
            style={{
              left: `${rect.left}px`,
              top: `${rect.top}px`,
              width: `${rect.width}px`,
              height: `${rect.height}px`,
            }}
          />
        );
    }
    // Preview for freehand drawing
    if (drawingPoints) {
        return (
            <svg className="absolute top-0 left-0 w-full h-full overflow-visible">
                <path
                    d={pointsToPath(drawingPoints)}
                    stroke={SHAPE_COLORS.stroke}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        )
    }
    return null;
  };

  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-800"
      style={{ cursor: activeTool === 'select' ? 'grab' : 'crosshair' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp} // Finalize creation if mouse leaves canvas
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      ></div>

      <div 
        className="absolute top-0 left-0"
        style={{ transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})` }}
      >
        {renderCreationPreview()}
        {objects.map(obj => (
          <CanvasObjectWrapper 
            key={obj.id} 
            object={obj} 
            onUpdate={onUpdateObject}
            onDelete={onDeleteObject}
            isSelected={selectedObjectId === obj.id}
            onSelect={() => {
                if (activeTool === 'select') {
                    setSelectedObjectId(obj.id);
                }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CanvasArea;