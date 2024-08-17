'use client';
import { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { prominent } from 'color.js';
import AlbumContent from '@/components/AlbumContent';
import Icon from '@/components/Icon';
import MusicController from '@/components/MusicController';
import Playlist from '@/components/Playlist';
import { motion } from 'framer-motion';

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

const initialMusicIndex = 0;

// Utility functions
const rgbToString = (rgb: number[]) => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
const adjustBrightness = (color: number[], amount: number) => color.map(c => Math.max(0, Math.min(255, c + amount)));

export default function MusicPlayer() {
  const [currentMusicIndex, setCurrentMusicIndex] = useState<number>(initialMusicIndex);
  const [isListMode, setIsListMode] = useState<boolean>(false);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [MusicsData, setMusicsData] = useState<MusicStruct[]>([]);
  const [currentVideoId, setCurrentVideoId] = useState<string>('');
  const [colorScheme, setColorScheme] = useState<ColorScheme>({
    background: 'linear-gradient(to bottom, #000000, #000000)',
    secondary: '#FFFFFF50'
  });

  const intervalRef = useRef<any>(null);
  const isSeekedRef = useRef<boolean>(false);

  const currentMusic = MusicsData[currentMusicIndex];

  useEffect(() => {
    async function getMusicsData() {
      try {
        const response = await fetch('/api/music');
        const result = await response.json();
        const transformedData: MusicStruct[] = result.data.map((item: any) => ({
          artist: item.attributes.artistName,
          color: '#' + item.attributes.artwork.bgColor,
          duration: Math.floor(item.attributes.durationInMillis / 1000),
          id: item.id,
          title: item.attributes.name,
          albumart: item.attributes.artwork.url.replace('{w}', '400').replace('{h}', '400'),
        }));
        setMusicsData(transformedData);
      } catch (error) {
        console.error('Error fetching music data:', error);
      }
    }

    getMusicsData();
  }, []);

  useEffect(() => {
    async function extractColors() {
      if (currentMusic) {
        try {
          const palette = await prominent(currentMusic.albumart, { amount: 2, format: 'rgb' });
          const mainColor = adjustBrightness(palette[0] as number[], -30);
          const secondaryColor = adjustBrightness(palette[1] as number[], -30);

          setColorScheme({
            background: `linear-gradient(to bottom, ${rgbToString(mainColor)}, ${rgbToString(adjustBrightness(mainColor, -50))})`,
            secondary: rgbToString(secondaryColor)
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
      const response = await fetch(`/api/search?query=${currentMusic.title} ${currentMusic.artist} topic audio`);
      const result = await response.json();
      setCurrentVideoId(result.data.id);
      console.log(result.data.id);
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
  }

  function handleMusicClick(index: number) {
    setCurrentMusicIndex(index);
  }

  return (
    <>
      {MusicsData.length != 0 && (
        <div
          style={{
            background: colorScheme.background
          }}
          className="flex h-dvh w-dvw flex-col items-center justify-center gap-32 overflow-hidden px-32 transition-all duration-300"
        >
          <div className="my-48 flex grow flex-col items-center justify-between gap-32 self-stretch md:max-h-[720px]">
            <AlbumContent
              currentMusic={currentMusic}
              isListMode={isListMode}
              isPlaying={isPlaying}
              onListClick={handleListClick}
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
            <div className="flex flex-col gap-24 self-stretch md:w-[400px] md:self-center">
              {!isListMode && (
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
                  <motion.div
                    layoutId="list"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleListClick}
                    layout
                    className="flex cursor-pointer items-center justify-center rounded-full bg-white/10 p-8"
                  >
                    <Icon type="list" className="size-16 text-white" />
                  </motion.div>
                </div>
              )}
              <MusicController
                currentTime={currentTime}
                duration={duration}
                isPlaying={isPlaying}
                onControl={handleControl}
                onNext={handleNext}
                onPrev={handlePrev}
                onSeek={handleSeek}
              />
            </div>
          </div>
          <title>{`${currentMusic.title} (${currentMusic.artist}) - 최근에 들은 노래`}</title>
        </div>
      )}
    </>
  );
}