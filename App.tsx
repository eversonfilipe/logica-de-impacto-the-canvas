import React, { useState, useCallback, useEffect } from 'react';
import CanvasArea from './features/canvas/CanvasArea';
import Toolbar from './features/toolbar/Toolbar';
import AiPanel from './features/ai/AiPanel';
import CanvasManager from './features/sidebar/CanvasManager';
import type { Canvas, CanvasObject, Tool, TextBoxObject } from './types';
import { INITIAL_CANVASES } from './constants';
import * as geminiService from './services/geminiService';

const App: React.FC = () => {
  const [canvases, setCanvases] = useState<Canvas[]>(INITIAL_CANVASES);
  const [activeCanvasId, setActiveCanvasId] = useState<string>(INITIAL_CANVASES[0]?.id || '');
  
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const activeCanvas = canvases.find(c => c.id === activeCanvasId);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
            handleDeleteObject(selectedObjectId);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId]);

  const updateCanvas = (canvasId: string, updatedObjects: CanvasObject[]) => {
      setCanvases(canvases.map(c => c.id === canvasId ? { ...c, objects: updatedObjects } : c));
  };
  
  const handleUpdateObject = useCallback((id: string, newObjectData: Partial<CanvasObject>) => {
      if (!activeCanvas) return;
      const updatedObjects = activeCanvas.objects.map(obj => 
        obj.id === id ? { ...obj, ...newObjectData } as CanvasObject : obj
      );
      updateCanvas(activeCanvas.id, updatedObjects);
  }, [activeCanvas, canvases]);

  const handleAddObject = useCallback((newObject: CanvasObject) => {
    if (!activeCanvas) return;
    const updatedObjects = [...activeCanvas.objects, newObject];
    updateCanvas(activeCanvas.id, updatedObjects);
    // Select the newly created object and switch to the select tool.
    setSelectedObjectId(newObject.id);
    setActiveTool('select');
  }, [activeCanvas, canvases]);
  
  const handleDeleteObject = useCallback((id: string) => {
    if (!activeCanvas) return;
    const updatedObjects = activeCanvas.objects.filter(obj => obj.id !== id);
    updateCanvas(activeCanvas.id, updatedObjects);
    setSelectedObjectId(null);
  }, [activeCanvas, canvases]);
    
  // Creates a new text object on the canvas from the AI-generated content.
  const handleAddAiResponseToCanvas = (content: string) => {
      if (!activeCanvas) return;
      
      let formattedText = content;
      try {
          // Pretty-print the JSON for better readability on the canvas
          const parsed = JSON.parse(content);
          formattedText = JSON.stringify(parsed, null, 2);
      } catch {
          // If it's not JSON, use the raw text.
      }
      
      const newTextObject: TextBoxObject = {
          id: `ai-doc-${Date.now()}`,
          type: 'text',
          position: { x: 100, y: 100 }, // Default position
          size: { width: 400, height: 500 }, // Larger size for a document
          data: {
              text: formattedText,
              fontSize: 14,
              color: '#333333'
          }
      };
      
      handleAddObject(newTextObject);
  }

  // AI Handlers
  const handleAiAction = async (action: (objects: CanvasObject[], ...args: any[]) => Promise<string>, ...args: any[]) => {
    if (!activeCanvas || activeCanvas.objects.length === 0) {
        setAiResponse("Canvas is empty. Add some notes to use AI features.");
        return;
    }
    setIsLoadingAi(true);
    setAiResponse('');
    setError(null);
    try {
      const response = await action(activeCanvas.objects, ...args);
      setAiResponse(response);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown AI error occurred.';
      setError(errorMessage);
      setAiResponse(`Error: ${errorMessage}`);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSummarize = () => handleAiAction(geminiService.summarizeCanvas);
  const handleGenerateBrief = async () => {
    await handleAiAction(geminiService.generateProjectBrief);
    // No longer formatting here; the raw JSON is passed to the panel
  };
  const handleChat = (message: string) => handleAiAction(geminiService.canvasChat, message);

  return (
    <div className="h-screen w-screen font-sans text-gray-900 dark:text-gray-100 flex flex-col">
      
      <header className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 shadow-sm z-40">
        <h1 className="text-lg font-bold">The Canvas: Lógica de Impacto</h1>
        <CanvasManager 
            canvases={canvases}
            activeCanvasId={activeCanvasId}
            onSelectCanvas={setActiveCanvasId}
            onAddCanvas={(name) => {
                const newCanvas = { id: `canvas-${Date.now()}`, name, objects: [] };
                setCanvases([...canvases, newCanvas]);
                setActiveCanvasId(newCanvas.id);
            }}
            onDeleteCanvas={(id) => {
                setCanvases(canvases.filter(c => c.id !== id));
                if (activeCanvasId === id) {
                    setActiveCanvasId(canvases[0]?.id || '');
                }
            }}
            onRenameCanvas={(id, newName) => {
                setCanvases(canvases.map(c => c.id === id ? {...c, name: newName } : c));
            }}
        />
      </header>
      
      <main className="flex-grow relative">
        <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />
        
        {activeCanvas && (
            <CanvasArea 
                objects={activeCanvas.objects} 
                onUpdateObject={handleUpdateObject}
                onAddObject={handleAddObject}
                onDeleteObject={handleDeleteObject}
                selectedObjectId={selectedObjectId}
                setSelectedObjectId={setSelectedObjectId}
                activeTool={activeTool}
            />
        )}
        
        <AiPanel 
            onSummarize={handleSummarize}
            onGenerateBrief={handleGenerateBrief}
            onChat={handleChat}
            onAddAiResponseToCanvas={handleAddAiResponseToCanvas}
            isLoading={isLoadingAi}
            aiResponse={aiResponse}
        />
      </main>
    </div>
  );
};

export default App;