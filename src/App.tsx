import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { StorySection, ChoiceSection } from "./components/GameUI";
import { generateInitialScene, generateNextTurn, generateSceneImage } from "./services/gemini";
import { GameState, StoryTurn } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RotateCcw } from "lucide-react";

export default function App() {
  const [state, setState] = useState<GameState>({
    inventory: [],
    currentQuest: "",
    storyHistory: [],
    worldContext: ""
  });

  const [loading, setLoading] = useState(false);
  const [currentDisplay, setCurrentDisplay] = useState<{
    text: string;
    choices: string[];
    imageUrl?: string;
  }>({
    text: "The fabric of reality begins to shimmer as your story awaits...",
    choices: [],
  });

  const initialized = useRef(false);

  const startNewGame = async () => {
    setLoading(true);
    try {
      const scene = await generateInitialScene();
      const imageUrl = await generateSceneImage(scene.imagePrompt);

      setCurrentDisplay({
        text: scene.storyText,
        choices: scene.choices,
        imageUrl
      });

      setState({
        inventory: scene.newItems || [],
        currentQuest: scene.newQuest || "Begin the journey",
        storyHistory: [{
          role: 'model',
          text: scene.storyText,
          choices: scene.choices,
          imagePrompt: scene.imagePrompt,
          imageUrl,
          inventoryUpdate: scene.newItems,
          questUpdate: scene.newQuest
        }],
        worldContext: ""
      });
    } catch (error) {
      console.error("Failed to start game:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      startNewGame();
    }
  }, []);

  const handleChoice = async (choice: string) => {
    setLoading(true);
    
    const userTurn: StoryTurn = { role: 'user', text: choice };
    const updatedHistory = [...state.storyHistory, userTurn];
    
    try {
      const historyForAI = updatedHistory.map(h => ({ role: h.role, text: h.text }));
      const nextScene = await generateNextTurn(choice, historyForAI, state);
      const imageUrl = await generateSceneImage(nextScene.imagePrompt);

      setCurrentDisplay({
        text: nextScene.storyText,
        choices: nextScene.choices,
        imageUrl
      });

      setState(prev => {
        let newInventory = [...prev.inventory];
        if (nextScene.newItems) newInventory = [...new Set([...newInventory, ...nextScene.newItems])];
        if (nextScene.removedItems) {
          newInventory = newInventory.filter(item => !nextScene.removedItems?.includes(item));
        }

        return {
          ...prev,
          inventory: newInventory,
          currentQuest: nextScene.newQuest || prev.currentQuest,
          storyHistory: [...updatedHistory, {
            role: 'model',
            text: nextScene.storyText,
            choices: nextScene.choices,
            imagePrompt: nextScene.imagePrompt,
            imageUrl,
          }]
        };
      });
    } catch (error) {
      console.error("Turn generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    startNewGame();
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 font-sans overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-600/10 blur-[120px]" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <header className="h-16 px-6 flex items-center justify-between border-b border-slate-800 bg-slate-950/50 backdrop-blur-md">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/20">
               <Sparkles className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-lg font-bold tracking-tight text-slate-100 uppercase bg-gradient-to-r from-slate-100 to-slate-400 bg-clip-text text-transparent">
               AetherQuest
             </h1>
           </div>

           <div className="flex items-center gap-4">
             <button 
                onClick={handleRestart}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors"
                title="Restart Adventure"
              >
               <RotateCcw className="w-5 h-5" />
             </button>
           </div>
        </header>

        {/* Story Content */}
        <StorySection 
          text={currentDisplay.text} 
          imageUrl={currentDisplay.imageUrl} 
          loading={loading}
        />

        {/* Choices */}
        <AnimatePresence>
          {currentDisplay.choices.length > 0 && !loading && (
            <ChoiceSection 
              choices={currentDisplay.choices} 
              onSelect={handleChoice} 
              disabled={loading}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full shrink-0">
        <Sidebar inventory={state.inventory} currentQuest={state.currentQuest} />
      </div>
    </div>
  );
}
