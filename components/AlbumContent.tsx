import Icon from '@/components/Icon';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface MusicStruct {
  artist: string;
  color: string;
  duration: number;
  id: string;
  title: string;
  albumart: string;
}

interface ColorScheme {
  background: string;
  secondary: string;
}

interface Props {
  currentMusic: MusicStruct;
  colorScheme: ColorScheme;
  isListMode: boolean;
  isLyricsMode: boolean;
  isPlaying: boolean;
  mode: 'specific' | 'playlist';
  onListClick: () => void;
  onLyricsClick: () => void;
  onAlbumartClick: () => void;
  children: ReactNode;
}

export default function AlbumContent({
  currentMusic,
  colorScheme,
  isListMode,
  isLyricsMode,
  isPlaying,
  mode,
  onListClick,
  onLyricsClick,
  onAlbumartClick,
  children,
}: Props) {
  return (
    <motion.div
      className={
        (isListMode || isLyricsMode)
          ? 'flex size-72 w-full items-center justify-start gap-16 self-start md:mx-auto md:w-[400px]'
          : 'flex min-h-0 w-full grow basis-0 items-start justify-center'
      }
    >
      <motion.div className={(isListMode || isLyricsMode) ? 'aspect-square h-full' : 'size-full md:max-w-[400px]'}>
        <motion.div
          onClick={onAlbumartClick}
          animate={isPlaying || (isListMode || isLyricsMode) ? 'active' : 'shrink'}
          data-list={(isListMode || isLyricsMode)}
          variants={{
            active: { scale: 1, transition: { damping: 20, stiffness: 260, type: 'spring' } },
            shrink: { scale: 0.8, transition: { damping: 20, stiffness: 260, type: 'spring' } },
          }}
          layout
          className="mx-auto aspect-square max-h-full max-w-full overflow-hidden rounded-8 data-[list=false]:rounded-16"
        >
          {children}
        </motion.div>
      </motion.div>
      {(isListMode || isLyricsMode) && (
        <div className="flex grow items-center">
          <div className="flex grow flex-col">
            <motion.div layoutId="title" layout className="grow text-18 font-600 text-white">
              {currentMusic.title}
            </motion.div>
            <motion.div layoutId="artist" layout className="grow text-15 font-500 text-white/60">
              {currentMusic.artist}
            </motion.div>
          </div>
          <motion.div
            layoutId="lyrics"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLyricsClick}
            layout
            className={`flex cursor-pointer items-center justify-center rounded-full p-8 mr-10 ml-10`}
            style={{
              backgroundColor: isLyricsMode ? colorScheme.secondary : '#ffffff30',
              border: isLyricsMode ? `1px solid #ffffff20` : 'none'
            }}
          >
            <Icon
              type="lyrics"
              className="size-16"
            />
          </motion.div>
          <motion.div
            layoutId="list"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onListClick}
            layout
            className={`flex cursor-pointer items-center justify-center rounded-full p-8`}
            style={{
              backgroundColor: isListMode ? colorScheme.secondary : '#ffffff30',
              border: isListMode ? `1px solid #ffffff20` : 'none',
              width: mode === 'playlist' ? 'inset' : '0px',
              height: mode === 'playlist' ? 'inset' : '0px',
              padding: mode === 'playlist' ? 'inset' : '0px',
            }}
          >
            <Icon
              type="list"
              className="size-16"
            />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
