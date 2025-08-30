export type Tool = 'select' | 'text' | 'sticky' | 'rectangle' | 'ellipse' | 'arrow' | 'draw';

export interface CanvasObjectBase {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface StickyNoteData {
  text: string;
  color: string;
}

export interface StickyNoteObject extends CanvasObjectBase {
  type: 'sticky';
  data: StickyNoteData;
}

export interface TextBoxData {
  text: string;
  fontSize: number;
  color: string;
}

export interface TextBoxObject extends CanvasObjectBase {
  type: 'text';
  data: TextBoxData;
}

export interface ShapeData {
  shape: 'rectangle' | 'ellipse' | 'arrow';
  color: string;
  stroke: string;
  strokeWidth: number;
}

export interface ShapeObject extends CanvasObjectBase {
  type: 'shape';
  data: ShapeData;
}

// Represents a freehand drawing on the canvas.
export interface DrawingData {
    // Array of points that make up the path.
    points: { x: number; y: number }[];
    stroke: string;
    strokeWidth: number;
}

export interface DrawingObject extends CanvasObjectBase {
    type: 'draw';
    data: DrawingData;
}


export type CanvasObject = StickyNoteObject | TextBoxObject | ShapeObject | DrawingObject;

export interface Canvas {
  id: string;
  name: string;
  objects: CanvasObject[];
}