import React from 'react';
import { PointerIcon, AddNoteIcon, TextIcon, RectangleIcon, EllipseIcon, ArrowIcon, PencilIcon } from '../../components/icons';
import type { Tool } from '../../types';

interface ToolbarProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const tools: { name: Tool, icon: React.FC<{className?: string}>, label: string }[] = [
    { name: 'select', icon: PointerIcon, label: 'Select Tool' },
    { name: 'sticky', icon: AddNoteIcon, label: 'Add Sticky Note' },
    { name: 'text', icon: TextIcon, label: 'Add Text' },
    { name: 'rectangle', icon: RectangleIcon, label: 'Add Rectangle' },
    { name: 'ellipse', icon: EllipseIcon, label: 'Add Ellipse' },
    { name: 'arrow', icon: ArrowIcon, label: 'Add Arrow' },
    { name: 'draw', icon: PencilIcon, label: 'Draw Tool' },
];

const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolChange }) => {
  return (
    <div className="absolute top-20 left-4 z-30 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg flex flex-col space-y-2">
      {tools.map(tool => (
        <button
          key={tool.name}
          onClick={() => onToolChange(tool.name)}
          aria-label={tool.label}
          className={`p-3 rounded-md transition-colors duration-200 ${
            activeTool === tool.name 
              ? 'bg-blue-500 text-white' 
              : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <tool.icon className="w-6 h-6" />
        </button>
      ))}
    </div>
  );
};

export default Toolbar;