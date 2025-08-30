import React, { useEffect, useRef } from 'react';
import type { CanvasObject, ShapeObject, TextBoxObject, DrawingObject } from '../../types';
import StickyNote from './StickyNote';
import { TrashIcon } from '../../components/icons';

// A dedicated component for rendering geometric shapes using SVG.
// It handles rectangles, ellipses, and arrows within a bounding box.
const Shape: React.FC<{ object: ShapeObject; size: {width: number, height: number} }> = ({ object, size }) => {
    const { shape, color, stroke, strokeWidth } = object.data;
    const { width, height } = size;

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="w-full h-full" style={{overflow: 'visible'}}>
            {/* Arrowhead definition for the 'arrow' shape */}
            <defs>
                <marker
                    id={`arrowhead-${object.id}`}
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={stroke} />
                </marker>
            </defs>
            {(() => {
                switch(shape) {
                    case 'rectangle':
                        return <rect x="0" y="0" width={width} height={height} fill={color} stroke={stroke} strokeWidth={strokeWidth} />;
                    case 'ellipse':
                        return <ellipse cx={width/2} cy={height/2} rx={width/2} ry={height/2} fill={color} stroke={stroke} strokeWidth={strokeWidth} />;
                    case 'arrow':
                        // The arrow is drawn diagonally across its bounding box.
                        return <line 
                                   x1={strokeWidth} y1={height - strokeWidth} // Start from bottom-left
                                   x2={width - strokeWidth} y2={strokeWidth} // End at top-right
                                   stroke={stroke} 
                                   strokeWidth={strokeWidth} 
                                   markerEnd={`url(#arrowhead-${object.id})`}
                               />;
                    default:
                        return null;
                }
            })()}
        </svg>
    )
};

// A component for rendering and editing free-form text on the canvas.
const TextBox: React.FC<{
    object: TextBoxObject;
    onTextChange: (id: string, text: string) => void;
    isSelected: boolean;
}> = ({ object, onTextChange, isSelected }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { text, color, fontSize } = object.data;
    
    // Auto-focus logic for immediate editing upon creation.
    useEffect(() => {
        if (isSelected && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isSelected]);
    
    return (
        <textarea
            ref={textareaRef}
            className="w-full h-full bg-transparent resize-none focus:outline-none p-2"
            style={{ color, fontSize: `${fontSize}px` }}
            value={text}
            onChange={(e) => onTextChange(object.id, e.target.value)}
            onMouseDown={(e) => e.stopPropagation()} // Prevent canvas pan
            placeholder="Type..."
        />
    )
};

// A component for rendering a freehand drawing from a set of points.
const Drawing: React.FC<{ object: DrawingObject; size: {width: number, height: number} }> = ({ object, size }) => {
    const { points, stroke, strokeWidth } = object.data;
    if (points.length < 2) return null;

    // Creates the 'd' attribute for an SVG path from an array of points.
    const pathData = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${size.width} ${size.height}`} style={{overflow: 'visible'}}>
            <path
                d={pathData}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};


interface CanvasObjectWrapperProps {
  object: CanvasObject;
  onUpdate: (id: string, newObjectData: Partial<CanvasObject>) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

// This component wraps each canvas object, providing common functionality
// like positioning, selection highlights, drag handles, and a delete button.
const CanvasObjectWrapper: React.FC<CanvasObjectWrapperProps> = ({ object, onUpdate, onDelete, isSelected, onSelect }) => {
  
  // A single handler to update the text content for both StickyNote and TextBox.
  const handleTextChange = (id: string, text: string) => {
    if (object.type === 'sticky' || object.type === 'text') {
        onUpdate(id, { data: { ...object.data, text } });
    }
  }

  // Renders the specific component based on the object's type.
  const renderObject = () => {
    switch (object.type) {
      case 'sticky':
        return <StickyNote note={object} onTextChange={handleTextChange} isSelected={isSelected} />;
      case 'shape':
        return <Shape object={object} size={object.size} />;
      case 'text':
        return <TextBox object={object} onTextChange={handleTextChange} isSelected={isSelected}/>;
      case 'draw':
        return <Drawing object={object} size={object.size} />;
      default:
        return null;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      className={`absolute transition-shadow duration-200 ${isSelected ? 'shadow-2xl z-20' : 'z-10'}`}
      style={{
        left: `${object.position.x}px`,
        top: `${object.position.y}px`,
        width: `${object.size.width}px`,
        height: `${object.size.height}px`,
        outline: isSelected ? '2px solid #3B82F6' : 'none',
        outlineOffset: '4px',
        borderRadius: '0.25rem',
        cursor: 'move',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Delete button shown only when the object is selected */}
      {isSelected && (
        <button
          onClick={() => onDelete(object.id)}
          className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 z-30"
          aria-label="Delete object"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
      {renderObject()}
    </div>
  );
};

export default CanvasObjectWrapper;