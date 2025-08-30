import React, { useEffect, useRef } from 'react';
import type { StickyNoteObject } from '../../types';

interface StickyNoteProps {
  note: StickyNoteObject;
  onTextChange: (id: string, text: string) => void;
  isSelected: boolean;
}

const StickyNote: React.FC<StickyNoteProps> = ({ note, onTextChange, isSelected }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTextChange(note.id, e.target.value);
  };

  // Auto-focus the textarea when the note is selected, for a better UX on creation.
  useEffect(() => {
    if (isSelected && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select(); // Select text for easy replacement
    }
  }, [isSelected]);


  return (
    <div
      className="w-full h-full p-4 rounded-lg shadow-lg"
      style={{ 
        backgroundColor: note.data.color,
        boxSizing: 'border-box'
      }}
    >
      <textarea
        ref={textareaRef}
        className="w-full h-full bg-transparent resize-none focus:outline-none text-gray-800 placeholder-gray-600"
        value={note.data.text}
        onChange={handleTextChange}
        onMouseDown={(e) => e.stopPropagation()} // Prevent canvas panning when interacting with text
        placeholder="Type something..."
      />
    </div>
  );
};

export default StickyNote;