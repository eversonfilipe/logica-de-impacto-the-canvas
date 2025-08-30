import React, { useState, useCallback, useRef } from 'react';
import type { CanvasObject, Tool } from '../../types';
import CanvasObjectWrapper from './CanvasObjectWrapper';

interface CanvasAreaProps {
  objects: CanvasObject[];
  onUpdateObject: (id: string, newObjectData: Partial<CanvasObject>) => void;
  onAddObject: (object: CanvasObject) => void;
  onDeleteObject: (id: string) => void;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  activeTool: Tool;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({ 
  objects, onUpdateObject, onAddObject, onDeleteObject, 
  selectedObjectId, setSelectedObjectId, activeTool 
}) => {
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [isPannable, setIsPannable] = useState(true);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);


  const getCanvasCoordinates = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewport.x) / viewport.scale;
    const y = (e.clientY - rect.top - viewport.y) / viewport.scale;
    return { x, y };
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.1, viewport.scale + scaleAmount), 5);
    
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - viewport.x) * (newScale / viewport.scale);
    const newY = mouseY - (mouseY - viewport.y) * (newScale / viewport.scale);

    setViewport({ x: newX, y: newY, scale: newScale });
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
      if (e.target !== canvasRef.current) {
          // Click was on an object, not the canvas itself
          return;
      }

      if (activeTool === 'select') {
          panStartRef.current = { x: e.clientX, y: e.clientY };
          setIsPannable(true);
          setSelectedObjectId(null);
      } else {
          // Create new object
          const { x, y } = getCanvasCoordinates(e);
          // ... create object logic in handleMouseUp to avoid creating while dragging
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (panStartRef.current && isPannable) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setViewport(v => ({ ...v, x: v.x + dx, y: v.y + dy }));
      panStartRef.current = { x: e.clientX, y: e.clientY };
    }
  };
  
  const handleMouseUp = (e: React.MouseEvent) => {
    panStartRef.current = null;
    if (activeTool !== 'select' && e.target === canvasRef.current) {
      const { x, y } = getCanvasCoordinates(e);
      // Logic to create a new object based on activeTool
    }
  };


  return (
    <div 
      ref={canvasRef}
      className="relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-800 cursor-grab"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => panStartRef.current = null}
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
