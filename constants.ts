import type { Canvas } from './types';

export const STICKY_NOTE_COLORS = [
  '#FFF9C4', // yellow
  '#C8E6C9', // green
  '#BBDEFB', // blue
  '#F8BBD0', // pink
  '#E1BEE7', // purple
];

export const SHAPE_COLORS = {
  fill: '#E0E0E0',
  stroke: '#616161',
};


export const INITIAL_CANVASES: Canvas[] = [
  {
    id: `canvas-${Date.now()}`,
    name: 'My First Canvas',
    objects: [
      {
        id: 'idea-1',
        type: 'sticky',
        position: { x: 100, y: 150 },
        size: { width: 200, height: 150 },
        data: {
          text: 'User authentication feature using JWT.',
          color: STICKY_NOTE_COLORS[0],
        },
      },
      {
        id: 'idea-2',
        type: 'sticky',
        position: { x: 400, y: 200 },
        size: { width: 200, height: 150 },
        data: {
          text: 'Develop a real-time collaboration engine with WebSockets.',
          color: STICKY_NOTE_COLORS[2],
        },
      },
      {
        id: 'idea-3',
        type: 'sticky',
        position: { x: 250, y: 400 },
        size: { width: 200, height: 150 },
        data: {
          text: 'AI-powered summarization of canvas content.',
          color: STICKY_NOTE_COLORS[1],
        },
      },
    ],
  },
];
