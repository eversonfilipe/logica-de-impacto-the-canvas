import React, { useState } from 'react';
import type { Canvas } from '../../types';

interface CanvasManagerProps {
  canvases: Canvas[];
  activeCanvasId: string;
  onSelectCanvas: (id: string) => void;
  onAddCanvas: (name: string) => void;
  onDeleteCanvas: (id: string) => void;
  onRenameCanvas: (id: string, newName: string) => void;
}

const CanvasManager: React.FC<CanvasManagerProps> = ({
  canvases,
  activeCanvasId,
  onSelectCanvas,
  onAddCanvas,
  onDeleteCanvas,
  onRenameCanvas,
}) => {
  const [newCanvasName, setNewCanvasName] = useState('');

  const handleAddCanvas = () => {
    const name = newCanvasName.trim() || `Canvas ${canvases.length + 1}`;
    onAddCanvas(name);
    setNewCanvasName('');
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        value={activeCanvasId}
        onChange={(e) => onSelectCanvas(e.target.value)}
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
      >
        {canvases.map((canvas) => (
          <option key={canvas.id} value={canvas.id}>
            {canvas.name}
          </option>
        ))}
      </select>
      <div className="flex items-center">
        <input
          type="text"
          value={newCanvasName}
          onChange={(e) => setNewCanvasName(e.target.value)}
          placeholder="New canvas name..."
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-l-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button onClick={handleAddCanvas} className="p-2 text-sm font-medium text-white bg-blue-600 rounded-r-lg border border-blue-600 hover:bg-blue-700">
          + Add
        </button>
      </div>
    </div>
  );
};

export default CanvasManager;
