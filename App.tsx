import React, { useState, useCallback, useEffect } from 'react';
import CanvasArea from './features/canvas/CanvasArea';
import Toolbar from './features/toolbar/Toolbar';
import AiPanel from './features/ai/AiPanel';
import CanvasManager from './features/sidebar/CanvasManager';
import type { Canvas, CanvasObject, Tool } from './types';
import { INITIAL_CANVASES, STICKY_NOTE_COLORS, SHAPE_COLORS } from './constants';
import * as geminiService from './services/geminiService';

const App: React.FC = () => {
  // FIX: Removed API key state management to adhere to security guidelines.
  // The API key is now handled exclusively via environment variables in the service layer.
  
  const [canvases, setCanvases] = useState<Canvas[]>(INITIAL_CANVASES);
  const [activeCanvasId, setActiveCanvasId] = useState<string>(INITIAL_CANVASES[0]?.id || '');
  
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);

  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [error, setError] = useState<string | null>(null);

  const activeCanvas = canvases.find(c => c.id === activeCanvasId);
  
  useEffect(() => {
    // FIX: Removed API key loading logic.
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObjectId) {
            handleDeleteObject(selectedObjectId);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedObjectId]);

  // FIX: Removed handleApiKeySubmit as API key is no longer managed in the UI.
  
  const updateCanvas = (canvasId: string, updatedObjects: CanvasObject[]) => {
      setCanvases(canvases.map(c => c.id === canvasId ? { ...c, objects: updatedObjects } : c));
  };
  
  const handleUpdateObject = useCallback((id: string, newObjectData: Partial<CanvasObject>) => {
      if (!activeCanvas) return;
      // FIX: Add type assertion to resolve TypeScript error. The spread operator with a union type
      // was causing incorrect type inference. The actual usage is safe, so an assertion is appropriate here.
      const updatedObjects = activeCanvas.objects.map(obj => 
        obj.id === id ? { ...obj, ...newObjectData } as CanvasObject : obj
      );
      updateCanvas(activeCanvas.id, updatedObjects);
  }, [activeCanvas, canvases]);

  // When a new object is added, it is automatically selected for immediate interaction.
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

  // AI Handlers
  // FIX: Updated AI action handler to not pass the API key, aligning with service layer changes.
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
    setAiResponse(prev => {
        try {
            const parsed = JSON.parse(prev);
            return JSON.stringify(parsed, null, 2);
        } catch { return prev; }
    });
  };
  const handleChat = (message: string) => handleAiAction(geminiService.canvasChat, message);

  return (
    <div className="h-screen w-screen font-sans text-gray-900 dark:text-gray-100 flex flex-col">
      {/* FIX: Removed ApiKeyModal component. */}
      
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
        
        {/* FIX: AI Panel is now always available. */}
        <AiPanel 
            onSummarize={handleSummarize}
            onGenerateBrief={handleGenerateBrief}
            onChat={handleChat}
            isLoading={isLoadingAi}
            aiResponse={aiResponse}
        />
      </main>
    </div>
  );
};

export default App;