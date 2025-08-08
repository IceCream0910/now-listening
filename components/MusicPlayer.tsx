'use client';
import { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { prominent, average } from 'color.js';
import AlbumContent from '@/components/AlbumContent';
import Icon from '@/components/Icon';
import MusicController from '@/components/MusicController';
import Playlist from '@/components/Playlist';
import { AnimatePresence, motion } from 'framer-motion';
import Lyrics from './Lyrics';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

interface MusicStruct {
  artist: string;
  color: string;
  duration: number;
  id: string;
  title: string;
  albumart: string;
  bgColor: string;
  textColor: string;
}

interface ColorScheme {
  background: string;
  secondary: string;
}

const initialMusicIndex = 0;

const rgbToString = (rgb: number[]) => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
const hexToRgb = (hex: string) => hex.match(/[A-Za-z0-9]{2}/g)!.map(v => parseInt(v, 16));
const adjustBrightness = (color: number[], amount: number) => color.map(c => Math.max(0, Math.min(255, c + amount)));

export default function MusicPlayer({ songId }: { songId?: string }) {
  const [currentMusicIndex, setCurrentMusicIndex] = useState<number>(initialMusicIndex);
  const [isListMode, setIsListMode] = useState<boolean>(false);
  const [isLyricsMode, setIsLyricsMode] = useState<boolean>(false);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [MusicsData, setMusicsData] = useState<MusicStruct[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [colorScheme, setColorScheme] = useState<ColorScheme>({
    background: 'linear-gradient(rgb(95, 132, 169), rgb(15, 52, 89))',
    secondary: '#FFFFFF50'
  });

  const router = useRouter();
  const intervalRef = useRef<any>(null);
  const isSeekedRef = useRef<boolean>(false);

  const currentMusic = MusicsData[currentMusicIndex];

  useEffect(() => {
    async function getRecent() {
      try {
        const response = await fetch(`/api/proxy?url=https://yuntae.in/api/music/recent`, { cache: 'no-store' });
        const result = await response.json();
        const transformedData: MusicStruct[] = result.data.map((item: any) => ({
          artist: item.attributes.artistName,
          color: '#' + item.attributes.artwork.bgColor,
          duration: Math.floor(item.attributes.durationInMillis / 1000),
          id: item.id,
          title: item.attributes.name,
          albumart: item.attributes.artwork.url.replace('{w}', '1000').replace('{h}', '1000'),
          bgColor: item.attributes.artwork.bgColor,
          textColor: item.attributes.artwork.textColor1
        }));
        setMusicsData(transformedData);
      } catch (error) {
        console.error('Error fetching music data:', error);
        setError(true);
      }
    }

    async function getSpecific(id: string) {
      try {
        const response = await fetch(`/api/proxy?url=https://yuntae.in/api/music/song/${songId}`, { cache: 'no-store' });
        const result = await response.json();
        const transformedData: MusicStruct[] = result.data.map((item: any) => ({
          artist: item.attributes.artistName,
          color: '#' + item.attributes.artwork.bgColor,
          duration: Math.floor(item.attributes.durationInMillis / 1000),
          id: item.id,
          title: item.attributes.name,
          albumart: item.attributes.artwork.url.replace('{w}', '1000').replace('{h}', '1000'),
          bgColor: item.attributes.artwork.bgColor,
          textColor: item.attributes.artwork.textColor1
        }));
        setMusicsData(transformedData);
      } catch (error) {
        console.error('Error fetching music data:', error);
        setError(true);
      }
    }

    if (songId) { // 특정 곡
      getSpecific(songId);
    } else { // 최근 재생 곡
      getRecent();
    }
  }, []);

  useEffect(() => {
    async function extractColors() {
      if (currentMusic) {
        try {
          setColorScheme({
            background: `linear-gradient(to bottom, #${currentMusic.bgColor}, ${rgbToString(adjustBrightness(hexToRgb(currentMusic.bgColor), -150))})`,
            secondary: `#${currentMusic.textColor}`
          });
        } catch (error) {
          console.error('Error extracting colors:', error);
          setColorScheme({
            background: 'linear-gradient(to bottom, #000000, #000000)',
            secondary: '#FFFFFF50'
          });
        }
      }
    }

    extractColors();
  }, [currentMusic]);

  useEffect(() => {
    console.log(colorScheme);
  }, [colorScheme]);

  useEffect(() => {
    intervalRef.current = setInterval(updateCurrentTime, 1000 / 30);
    return () => clearInterval(intervalRef.current);
  }, [player]);

  useEffect(() => {
    if (!player) return;

    const fetchVideoId = async () => {
      const response = await fetch(`/api/search?query=${currentMusic.title} ${currentMusic.artist}`, { cache: "no-store" });
      const result = await response.json();
      if (!result.videoId || result.videoId.length === 0) {
        toast.error('음원을 불러올 수 없어요. 저작권 등의 문제로 인해 아직 지원하지 않는 곡일 수 있어요.');
        player.pauseVideo()
        return;
      }
      setCurrentVideoId(result.videoId);
      console.log(result.videoId);
    };

    fetchVideoId();
  }, [currentMusicIndex, player]);

  useEffect(() => {
    if (currentVideoId && player) {
      try {
        player.loadVideoById(currentVideoId, 0);
      } catch (error) {
        console.error('Error loading video by ID:', error);
      }
    }
  }, [currentVideoId, player]);

  function updateCurrentTime() {
    if (!player) return;

    const playerState = player.getPlayerState();
    if (typeof playerState === 'undefined') return;

    const isPlaying = playerState === 1 || playerState === 3;
    setIsPlaying(isPlaying);

    const duration = player.getDuration() || 0;
    setDuration(duration);

    if (!isSeekedRef.current) {
      const currentTime = player.getCurrentTime() || 0;
      setCurrentTime(currentTime);
    }

    if (isPlaying) {
      isSeekedRef.current = false;
    }
  }

  function handleReady(e: YouTubeEvent) {
    setPlayer(e.target);
  }

  function handleEnd() {
    handleNext();
  }

  function handlePrev() {
    if (!player) return;
    setCurrentMusicIndex(prev => (prev - 1 + MusicsData.length) % MusicsData.length);
  }

  function handleNext() {
    if (!player) return;
    setCurrentMusicIndex(prev => (prev + 1) % MusicsData.length);
  }

  function handleControl() {
    if (!player) return;
    if (isPlaying) player.pauseVideo();
    else player.playVideo();
  }

  function handleSeek(time: number) {
    if (!player) return;
    player.seekTo(time, true);

    setCurrentTime(time);
    isSeekedRef.current = true;
  }

  function handleListClick() {
    setIsListMode(prev => !prev);
    setIsLyricsMode(false);
  }

  function handleLyricsClick() {
    setIsLyricsMode(prev => !prev);
    setIsListMode(false);
  }

  function handleBackToMainClick() {
    setIsListMode(false);
    setIsLyricsMode(false);
  }

  function handleMusicClick(index: number) {
    setCurrentMusicIndex(index);
  }

  function handleLyricClick(time: number) {
    if (!player) return;
    handleSeek(time);
  }



  if (error) {
    return (
      <div className='flex justify-center items-center h-dvh w-dvw'>
        <motion.div layoutId="title" layout className="grow font-700 text-28 text-center text-white">
          <h3>오류</h3>
          <span className="text-16">데이터를 불러오지 못했어요 :(</span>
        </motion.div>
      </div>
    )
  }

  if (MusicsData.length == 0) {
    return (<div className='flex justify-center items-center h-dvh w-dvw'>
      {songId ? (
        <svg className="mr-3 animate-spin text-white" viewBox="0 0 24 24" style={{ width: '34px', height: '34px' }}>
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <motion.div
          className="text-28 font-700 text-white animate-pulse"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          최근에 들은 노래
        </motion.div>
      )}
    </div>);
  }

  return (
    <AnimatePresence>
      <Toaster />
      <motion.div
        initial={{ background: 'linear-gradient(rgb(95, 132, 169), rgb(15, 52, 89))' }}
        animate={{ background: colorScheme.background }}
        transition={{ duration: 0.3 }}
        className="flex h-dvh w-dvw flex-col items-center justify-center gap-32 overflow-hidden px-32 transition-all duration-300"
      >
        <div className="my-48 flex grow flex-col items-center justify-between gap-32 self-stretch md:max-h-[720px]">
          <AlbumContent
            currentMusic={currentMusic}
            colorScheme={colorScheme}
            isListMode={isListMode}
            isLyricsMode={isLyricsMode}
            isPlaying={isPlaying}
            mode={songId ? 'specific' : 'playlist'}
            onListClick={handleListClick}
            onLyricsClick={handleLyricsClick}
            onAlbumartClick={handleBackToMainClick}
          >
            <img
              alt={currentMusic.title}
              src={currentMusic.albumart}
              className="size-full min-h-0"
            />
            <YouTube
              iframeClassName="size-full min-h-0"
              opts={{ playerVars: { autoplay: 1, controls: 0, modestbranding: 1, playsinline: 1 } }}
              videoId={currentVideoId}
              onEnd={handleEnd}
              onReady={handleReady}
              className="size-full min-h-0"
            />
          </AlbumContent>
          {isListMode && (
            <div className="min-h-0 w-full grow basis-0 self-stretch overflow-y-hidden">
              <Playlist musicsData={MusicsData} currentMusicIndex={currentMusicIndex} onMusicClick={handleMusicClick} />
            </div>
          )}
          {isLyricsMode && (
            <div className="min-h-0 w-full grow basis-0 self-stretch overflow-y-hidden">
              <Lyrics
                musicsData={MusicsData}
                currentMusicIndex={currentMusicIndex}
                onLyricClick={handleLyricClick}
                currentTime={currentTime}
                youtubeId={currentVideoId}
              />

            </div>
          )}
          <div className="flex flex-col gap-24 self-stretch md:w-[400px] md:self-center">
            {!isListMode && !isLyricsMode && (
              <div className="flex items-center justify-between">
                <div className="flex grow flex-col">
                  <motion.div layoutId="title" layout className="grow text-28 font-700 text-white">
                    {currentMusic.title}
                  </motion.div>
                  <motion.div
                    layoutId="artist"
                    layout
                    className="grow text-20 font-500 text-white/30"
                  >
                    {currentMusic.artist}
                  </motion.div>
                </div>

                <div className="group relative mr-8">
                  <motion.div
                    layoutId="lyrics"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLyricsClick}
                    layout
                    className="flex cursor-pointer items-center justify-center rounded-full bg-white/10 p-8"
                  >
                    <Icon type="lyrics" className="size-16 text-white" />
                  </motion.div>
                  <div className="absolute -top-32 left-1/2 -translate-x-1/2 transform opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none whitespace-nowrap bg-white/10 text-white text-xs px-8 py-1 rounded-full"
                    style={{ fontSize: '14px' }}>가사
                  </div>
                </div>

                <div className="group relative">
                  <motion.div
                    layoutId="list"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => songId ? router.push('/') : handleListClick()}
                    layout
                    className="flex cursor-pointer items-center justify-center rounded-full bg-white/10 p-8"
                  >
                    <Icon type="list" className="size-16 text-white" />
                  </motion.div>
                  <div className="absolute -top-32 left-1/2 -translate-x-1/2 transform opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none whitespace-nowrap bg-white/10 text-white text-xs px-6 py-1 rounded-full"
                    style={{ fontSize: '14px' }}>
                    {songId ? '최근' : '재생목록'}
                  </div>
                </div>

              </div>
            )}
            <MusicController
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              mode={songId ? 'specific' : 'playlist'}
              onControl={handleControl}
              onNext={handleNext}
              onPrev={handlePrev}
              onSeek={handleSeek}
            />
          </div>
        </div>
        <title>{`${currentMusic.title} (${currentMusic.artist}) ${!songId ? '- 최근에 들은 노래' : ''}`}</title>
      </motion.div>
    </AnimatePresence>
  );
}