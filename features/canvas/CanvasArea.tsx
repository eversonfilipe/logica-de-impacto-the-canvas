import React, { useState, useCallback, useRef } from 'react';
import type { CanvasObject, Tool, StickyNoteObject, TextBoxObject, ShapeObject } from '../../types';
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

// Defines the state for an object being created via drag-and-drop
interface CreationState {
    start: { x: number; y: number };
    current: { x: number; y: number };
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ 
  objects, onUpdateObject, onAddObject, onDeleteObject, 
  selectedObjectId, setSelectedObjectId, activeTool 
}) => {
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null);
  const [creationState, setCreationState] = useState<CreationState | null>(null);
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
      } else {
          // If another tool is active, begin creating a new object
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
    // If creating an object, update its current dimensions for the preview
    if (creationState) {
        setCreationState({ ...creationState, current: getCanvasCoordinates(e) });
    }
  };
  
  // Handles mouse up events, finalizing panning or object creation
  const handleMouseUp = () => {
    // Finalize object creation
    if (creationState) {
        const { start, current } = creationState;
        const width = Math.abs(current.x - start.x);
        const height = Math.abs(current.y - start.y);
        
        // Only create if the shape is larger than a few pixels (not a misclick)
        if (width > 5 || height > 5) {
            // FIX: Refactored object creation to be type-safe. Instead of creating an object
            // with an invalid `data` property and modifying it, this creates the correct
            // object structure within a switch statement, resolving the TypeScript error.
            let newObject: Omit<CanvasObject, 'id'>;
            const baseProperties = {
                position: {
                    x: Math.min(start.x, current.x),
                    y: Math.min(start.y, current.y),
                },
                size: { width, height },
            };
            
            // Customize the object based on the active tool
            switch (activeTool) {
                case 'sticky':
                    newObject = { ...baseProperties, type: 'sticky', data: { text: 'New Note', color: STICKY_NOTE_COLORS[0]} };
                    break;
                case 'text':
                    newObject = { ...baseProperties, type: 'text', data: { text: 'New Text', color: '#333333', fontSize: 16 } };
                    break;
                case 'rectangle':
                case 'ellipse':
                case 'arrow':
                     newObject = { ...baseProperties, type: 'shape', data: { shape: activeTool, color: SHAPE_COLORS.fill, stroke: SHAPE_COLORS.stroke, strokeWidth: 2 } };
                     break;
                default:
                    // This case should not be reached for creation tools, but it satisfies TypeScript's exhaustiveness check.
                    setPanStart(null);
                    setCreationState(null);
                    return;
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
                    ? { text: 'New Note', color: STICKY_NOTE_COLORS[0] } 
                    : { text: 'New Text', color: '#333333', fontSize: 16 }
            };
            onAddObject(newObject as CanvasObject);
        }
    }
    
    // Reset panning and creation states
    setPanStart(null);
    setCreationState(null);
  };

  // Renders a temporary preview of the object being created
  const renderCreationPreview = () => {
    if (!creationState) return null;

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