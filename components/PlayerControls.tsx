import React from 'react';
import { Play, Pause, Gauge, Repeat, Repeat1 } from 'lucide-react';
import { LoopMode } from '@/types';
import { LOOP_MODE_LABELS } from '@/constants';

interface PlayerControlsProps {
  isPlaying: boolean;
  playbackRate: number;
  loopMode: LoopMode;
  isGeneratingIPA: boolean;
  onPlayPause: () => void;
  onSpeedChange: () => void;
  onLoopModeChange: () => void;
}

export function PlayerControls({
  isPlaying,
  playbackRate,
  loopMode,
  isGeneratingIPA,
  onPlayPause,
  onSpeedChange,
  onLoopModeChange,
}: PlayerControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button
        onClick={onSpeedChange}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
        title="Playback speed"
      >
        <Gauge className="w-5 h-5 text-blue-400" />
        <span className="font-medium font-mono">{playbackRate.toFixed(2)}x</span>
      </button>

      <button
        onClick={onPlayPause}
        className="w-14 h-14 flex items-center justify-center rounded-full bg-emerald-600 hover:bg-emerald-500 text-white transition-transform active:scale-95"
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 fill-current" />
        ) : (
          <Play className="w-6 h-6 fill-current ml-1" />
        )}
      </button>

      <button
        onClick={onLoopModeChange}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          loopMode !== 'none'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-transparent'
        }`}
        title="Loop (L)"
      >
        {loopMode === 'one' ? (
          <Repeat1 className="w-5 h-5" />
        ) : (
          <Repeat className="w-5 h-5" />
        )}
        <span className="font-medium hidden sm:inline">{LOOP_MODE_LABELS[loopMode]}</span>
      </button>
    </div>
  );
}
