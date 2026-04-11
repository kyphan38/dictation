'use client';

import React from 'react';
import { AppMode, LoopMode } from '@/types';
import { PlaybackSeekBar } from './PlaybackSeekBar';
import { PlayerControls } from './PlayerControls';

interface PlayerProps {
  isPlaying: boolean;
  duration: number;
  currentTime: number;
  playbackRate: number;
  appMode: AppMode;
  loopMode: LoopMode;
  isGeneratingIPA: boolean;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: () => void;
  onModeChange: (mode: AppMode) => void;
  onLoopModeChange: () => void;
}

export function Player({
  isPlaying,
  duration,
  currentTime,
  playbackRate,
  appMode,
  loopMode,
  isGeneratingIPA,
  onPlayPause,
  onSeek,
  onSpeedChange,
  onModeChange,
  onLoopModeChange,
}: PlayerProps) {
  return (
    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 shrink-0">
      <PlaybackSeekBar
        duration={duration}
        currentTime={currentTime}
        onSeek={onSeek}
      />
      <PlayerControls
        isPlaying={isPlaying}
        playbackRate={playbackRate}
        appMode={appMode}
        loopMode={loopMode}
        isGeneratingIPA={isGeneratingIPA}
        onPlayPause={onPlayPause}
        onSpeedChange={onSpeedChange}
        onModeChange={onModeChange}
        onLoopModeChange={onLoopModeChange}
      />
    </div>
  );
}
