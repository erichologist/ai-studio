import { motion } from "motion/react";
import { Loader2 } from "lucide-react";

interface StorySectionProps {
  text: string;
  imageUrl?: string;
  loading: boolean;
}

export function StorySection({ text, imageUrl, loading }: StorySectionProps) {
  return (
    <div className="flex-1 flex flex-col gap-8 p-4 md:p-8 lg:p-12 overflow-y-auto overflow-x-hidden relative">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <motion.div
          key={imageUrl}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 shadow-slate-950/50 group"
        >
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Scene AI visualization" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </motion.div>

        <motion.div
           key={text}
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ duration: 0.8 }}
           className="prose prose-invert prose-lg max-w-none font-serif leading-relaxed"
        >
          {text.split('\n\n').map((para, i) => (
            <p key={i} className="text-slate-200 text-lg md:text-xl selection:bg-amber-500/30">
              {para}
            </p>
          ))}
        </motion.div>

        {loading && (
          <div className="flex items-center gap-3 py-4">
            <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
            <span className="text-amber-500 font-mono text-sm uppercase tracking-widest animate-pulse">
              Consulting the shadows...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ChoiceButtonProps {
  choices: string[];
  onSelect: (choice: string) => void;
  disabled: boolean;
}

export function ChoiceSection({ choices, onSelect, disabled }: ChoiceButtonProps) {
  return (
    <div className="p-6 bg-slate-950/80 border-t border-slate-800 backdrop-blur-md">
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        {choices.map((choice, i) => (
          <motion.button
            key={choice}
            whileHover={{ scale: 1.02, backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            disabled={disabled}
            onClick={() => onSelect(choice)}
            className="group flex items-center text-left p-4 rounded-xl border border-slate-700 hover:border-amber-500/50 bg-slate-900/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="w-8 h-8 rounded-full border border-slate-600 group-hover:border-amber-500/50 flex items-center justify-center text-xs font-mono text-slate-500 group-hover:text-amber-500 mr-4 flex-shrink-0">
              {String.fromCharCode(65 + i)}
            </div>
            <span className="text-slate-300 group-hover:text-white font-medium">
                {choice}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
