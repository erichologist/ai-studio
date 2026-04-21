export interface GameState {
  inventory: string[];
  currentQuest: string;
  storyHistory: StoryTurn[];
  worldContext: string; // Summary of world revealed so far to stay within window
}

export interface StoryTurn {
  role: 'user' | 'model';
  text: string;
  choices?: string[];
  imagePrompt?: string;
  imageUrl?: string;
  inventoryUpdate?: string[];
  questUpdate?: string;
}

export interface StoryNode {
  storyText: string;
  choices: string[];
  imagePrompt: string;
  newItems?: string[];
  removedItems?: string[];
  newQuest?: string;
}
