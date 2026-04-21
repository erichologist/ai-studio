import { motion, AnimatePresence } from "motion/react";
import { Package, Map, ChevronRight } from "lucide-react";

interface SidebarProps {
  inventory: string[];
  currentQuest: string;
}

export function Sidebar({ inventory, currentQuest }: SidebarProps) {
  return (
    <aside className="w-full lg:w-80 h-full bg-slate-950/50 backdrop-blur-xl border-l border-slate-800 p-6 flex flex-col gap-8 overflow-y-auto">
      <div>
        <div className="flex items-center gap-2 mb-4 text-amber-400/80 uppercase tracking-widest text-xs font-bold font-mono">
          <Map className="w-4 h-4" />
          <span>Current Quest</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 shadow-inner">
          <p className="text-slate-200 font-serif leading-relaxed italic">
            {currentQuest || "Awaiting destiny..."}
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4 text-amber-400/80 uppercase tracking-widest text-xs font-bold font-mono">
          <Package className="w-4 h-4" />
          <span>Inventory</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence mode="popLayout">
            {inventory.length > 0 ? (
              inventory.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-3 py-1.5 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-300 text-sm font-medium flex items-center gap-2 shadow-sm"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                  {item}
                </motion.div>
              ))
            ) : (
              <p className="text-slate-500 text-xs italic font-serif">Pockets are empty...</p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-auto pt-8 border-t border-slate-800/50">
        <div className="bg-gradient-to-br from-amber-500/10 to-transparent p-4 rounded-xl border border-amber-500/10">
          <p className="text-slate-400 text-[10px] uppercase font-mono tracking-tighter leading-tight italic">
            Fate is not written in stone, but in the echoes of your choices.
          </p>
        </div>
      </div>
    </aside>
  );
}
