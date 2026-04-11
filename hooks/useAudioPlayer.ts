import { useState, useRef, useEffect } from 'react';
import { LoopMode } from '@/types';
import { DEFAULT_LOOP_MODE, LOOP_DELAY_MS } from '@/constants';
import { getNextPlaybackSpeed } from '@/lib/utils';

export function useAudioPlayer() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [loopMode, setLoopMode] = useState<LoopMode>(DEFAULT_LOOP_MODE);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoopDelayingRef = useRef<boolean>(false);
  const loopModeRef = useRef<LoopMode>(loopMode);

  useEffect(() => {
    loopModeRef.current = loopMode;
  }, [loopMode]);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioFile(file);
      setAudioURL(url);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
      isLoopDelayingRef.current = false;
    }
  };

  const changeSpeed = () => {
    const nextSpeed = getNextPlaybackSpeed(playbackRate);
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleLoopMode = () => {
    setLoopMode(prev => prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none');
  };

  return {
    audioFile,
    setAudioFile,
    audioURL,
    setAudioURL,
    duration,
    setDuration,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    playbackRate,
    loopMode,
    setLoopMode,
    audioRef,
    loopTimeoutRef,
    isLoopDelayingRef,
    loopModeRef,
    handleAudioUpload,
    togglePlayPause,
    handleSeek,
    changeSpeed,
    toggleLoopMode
  };
}
