import Icon from '@/components/Icon';
import { motion } from 'framer-motion';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import { PointerEvent as ReactPointerEvent, useRef, useState } from 'react';

interface Props {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  mode: 'specific' | 'playlist';
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
  mode,
  onControl,
  onNext,
  onPrev,
  onSeek,
}: Props) {
  const [isSeeking, setIsSeeking] = useState<boolean>(false);
  const [seekingTime, setSeekingTime] = useState<number>(0);

  const isSeekingRef = useRef<boolean>(false);
  const seekingTimeRef = useRef<number>(0);

  const prevRef = useRef<LottieRefCurrentProps>(null);
  const nextRef = useRef<LottieRefCurrentProps>(null);

  const barRef = useRef<HTMLDivElement>(null);

  function getTimeFromClientX(clientX: number) {
    if (!barRef.current) return 0;

    const element = barRef.current!;
    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = x / rect.width;
    const time = duration * percent;

    return Math.min(Math.max(time, 0), duration);
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

  function handlePrev() {
    prevRef.current?.goToAndPlay(0);
    onPrev();
  }

  function handleNext() {
    nextRef.current?.goToAndPlay(0);
    onNext();
  }

  const layeredTime = isSeeking ? seekingTime : currentTime;
  const percent = (layeredTime / (duration || 1)) * 100;

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
          <div>-{secondsToTime(duration - layeredTime)}</div>
        </div>
      </motion.div>
      <div className="flex items-center justify-center gap-52">
        {mode === 'playlist' &&
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={handlePrev}
            className="-m-12 cursor-pointer rounded-full p-12 transition-colors active:bg-white/10"
          >
            <Lottie
              animationData={require('@/public/lottie/play-prev.json')}
              autoplay={false}
              loop={false}
              lottieRef={prevRef}
              className="size-40"
            />
          </motion.div>}

        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onControl}
          className="-m-8 cursor-pointer rounded-full p-8 transition-colors active:bg-white/10"
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
        {mode === 'playlist' && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.8 }}
            onClick={handleNext}
            className="-m-12 cursor-pointer rounded-full p-12 transition-colors active:bg-white/10"
          >
            <Lottie
              animationData={require('@/public/lottie/play-next.json')}
              autoplay={false}
              loop={false}
              lottieRef={nextRef}
              className="size-40"
            />
          </motion.div>)
        }
      </div>
    </div>
  );
}
