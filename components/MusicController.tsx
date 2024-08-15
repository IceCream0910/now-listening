import Icon from '@/components/Icon';
import { motion } from 'framer-motion';
import { PointerEvent as ReactPointerEvent, useRef, useState } from 'react';

interface Props {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onControl: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
}

function secondsToTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function MusicController({
  currentTime,
  duration,
  isPlaying,
  onControl,
  onNext,
  onPrev,
  onSeek,
}: Props) {
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [seekingTime, setSeekingTime] = useState<number>(0);

  const isSeekingRef = useRef<boolean>(false);
  const seekingTimeRef = useRef<number>(0);

  const barRef = useRef<HTMLDivElement>(null);

  function getTimeFromClientX(clientX: number) {
    if (!barRef.current) return 0;

    const element = barRef.current!;
    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = x / rect.width;
    return duration * percent;
  }

  function handlePointerDown(e: ReactPointerEvent) {
    const time = getTimeFromClientX(e.clientX);

    isSeekingRef.current = true;
    seekingTimeRef.current = time;

    setIsSeeking(true);
    setSeekingTime(time);

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp, { once: true });
  }

  function handlePointerUp() {
    onSeek(seekingTimeRef.current);

    isSeekingRef.current = false;
    setIsSeeking(false);

    document.removeEventListener('pointermove', handlePointerMove);
  }

  function handlePointerMove(e: PointerEvent) {
    e.preventDefault();

    const time = getTimeFromClientX(e.clientX);

    setSeekingTime(time);
    seekingTimeRef.current = time;
  }

  const layeredTime = isSeeking ? seekingTime : currentTime;
  const percent = (layeredTime / duration) * 100;

  return (
    <div className="flex flex-col gap-48">
      <motion.div
        ref={barRef}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 1.03 }}
        onPointerDown={handlePointerDown}
        className="group flex select-none flex-col gap-8"
      >
        <div className="h-8 cursor-pointer overflow-hidden rounded-full bg-white/30 transition-all hover:-my-4 hover:h-16 group-active:-my-4 group-active:h-16">
          <div
            style={{ width: `${percent}%` }}
            className="h-full bg-white/30 transition-colors group-active:bg-white"
          />
        </div>
        <div className="flex items-center justify-between text-14 font-500 text-white/30 transition-colors group-active:text-white">
          <div>{secondsToTime(layeredTime)}</div>
          <div>{secondsToTime(duration)}</div>
        </div>
      </motion.div>
      <div className="flex items-center justify-center gap-52">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPrev}
          className="-m-12 rounded-full p-12 active:bg-white/10"
        >
          <Icon type="prev" className="size-40 text-white" />
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onControl}
          className="-m-8 rounded-full p-8 active:bg-white/10"
        >
          <motion.div
            key={isPlaying ? 'pause' : 'play'}
            animate={{ scale: 1 }}
            initial={{ scale: 0 }}
            transition={{ damping: 20, stiffness: 260, type: 'spring' }}
          >
            <Icon type={isPlaying ? 'pause' : 'play'} className="size-56 text-white" />
          </motion.div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onNext}
          className="-m-12 rounded-full p-12 active:bg-white/10"
        >
          <Icon type="next" className="size-40 text-white" />
        </motion.div>
      </div>
    </div>
  );
}
