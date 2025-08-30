export type Tool = 'select' | 'text' | 'sticky' | 'rectangle' | 'ellipse' | 'arrow';

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

export type CanvasObject = StickyNoteObject | TextBoxObject | ShapeObject;

export interface Canvas {
  id: string;
  name: string;
  objects: CanvasObject[];
}
