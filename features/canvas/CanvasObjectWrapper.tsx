import React from 'react';
import type { CanvasObject } from '../../types';
import StickyNote from './StickyNote';
import { TrashIcon } from '../../components/icons';

// In a real app, you'd have components for Shape and Text too.
// For now, we only have StickyNote.
const Shape = ({ object }: { object: any }) => <div className="w-full h-full bg-gray-300 rounded-md" style={{backgroundColor: object.data.color}}>{object.data.shape}</div>;
const TextBox = ({ object }: { object: any }) => <div className="w-full h-full"><p>{object.data.text}</p></div>;

interface CanvasObjectWrapperProps {
  object: CanvasObject;
  onUpdate: (id: string, newObjectData: Partial<CanvasObject>) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
}

const CanvasObjectWrapper: React.FC<CanvasObjectWrapperProps> = ({ object, onUpdate, onDelete, isSelected, onSelect }) => {
  
  const handleTextChange = (id: string, text: string) => {
    if (object.type === 'sticky') {
        onUpdate(id, { data: { ...object.data, text } });
    }
  }

  const renderObject = () => {
    switch (object.type) {
      case 'sticky':
        return <StickyNote note={object} onTextChange={handleTextChange} isFocused={false} />;
      case 'shape':
        return <Shape object={object} />;
      case 'text':
        return <TextBox object={object} />;
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
      className={`absolute cursor-move transition-shadow duration-200 ${isSelected ? 'shadow-2xl z-20' : 'z-10'}`}
      style={{
        left: `${object.position.x}px`,
        top: `${object.position.y}px`,
        width: `${object.size.width}px`,
        height: `${object.size.height}px`,
        outline: isSelected ? '2px solid #3B82F6' : 'none',
        outlineOffset: '4px',
      }}
      onMouseDown={handleMouseDown}
    >
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
