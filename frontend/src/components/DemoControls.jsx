import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

export default function DemoControls({
  isPlaying, onPlay, onPause, onRestart, onStep,
  currentStep, totalSteps, speed, onSpeedChange,
}) {
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-3.5 py-2 shrink-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[10px] text-slate-400 shrink-0">
            {currentStep}/{totalSteps}
          </span>
          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-velora-500 to-teal-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isPlaying ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onPlay}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-velora-500 text-white text-[11px] font-medium hover:bg-velora-600 transition-colors"
            >
              <Play size={11} /> Play
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onPause}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-200 text-slate-600 text-[11px] font-medium"
            >
              <Pause size={11} /> Pause
            </motion.button>
          )}
          <button onClick={onRestart} className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
            <RotateCcw size={12} />
          </button>
          <button onClick={onStep} className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
            <SkipForward size={12} />
          </button>
          <select
            value={speed}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="px-1.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-medium border-0 outline-none cursor-pointer"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={3}>3x</option>
          </select>
        </div>
      </div>
    </div>
  );
}
