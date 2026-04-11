import React from 'react';
import { formatTime } from '@/lib/utils';

interface PlaybackSeekBarProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export function PlaybackSeekBar({ duration, currentTime, onSeek }: PlaybackSeekBarProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <span className="text-sm font-mono text-gray-400 w-12 text-right">{formatTime(currentTime)}</span>
      <input
        type="range"
        min={0}
        max={duration || 100}
        step={0.01}
        value={currentTime}
        onChange={(e) => onSeek(parseFloat(e.target.value))}
        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
      />
      <span className="text-sm font-mono text-gray-400 w-12">{formatTime(duration)}</span>
    </div>
  );
}
