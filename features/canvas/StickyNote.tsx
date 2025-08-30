import React from 'react';
import type { StickyNoteObject } from '../../types';

interface StickyNoteProps {
  note: StickyNoteObject;
  onTextChange: (id: string, text: string) => void;
  isFocused: boolean;
}

const StickyNote: React.FC<StickyNoteProps> = ({ note, onTextChange, isFocused }) => {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(note.id, e.target.value);
  };

  return (
    <div
      className="w-full h-full p-4 rounded-lg shadow-lg"
      style={{ 
        backgroundColor: note.data.color,
        boxSizing: 'border-box'
      }}
    >
      <textarea
        className="w-full h-full bg-transparent resize-none focus:outline-none text-gray-800 placeholder-gray-600"
        value={note.data.text}
        onChange={handleTextChange}
        onMouseDown={(e) => e.stopPropagation()}
        placeholder="Type something..."
        autoFocus={isFocused}
      />
    </div>
  );
};

export default StickyNote;
