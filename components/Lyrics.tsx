import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface MusicStruct {
  artist: string;
  color: string;
  duration: number;
  id: string;
  title: string;
  albumart: string;
}

interface Props {
  musicsData: MusicStruct[];
  currentMusicIndex: number;
  onLyricClick: (index: number) => void;
  currentTime: number;
  youtubeId?: string;
}

interface LyricLine {
  text: string;
  start: number;
  end: number;
  syllables?: {
    text: string;
    start: number;
    end: number;
  }[];
}

const parseTTML = (ttml: string): LyricLine[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(ttml, 'text/xml');
  const pTags = xmlDoc.getElementsByTagName('p');

  return Array.from(pTags).map((p) => {
    const start = parseTimeToSeconds(p.getAttribute('begin') || '0');
    const end = parseTimeToSeconds(p.getAttribute('end') || '0');
    const spans = p.getElementsByTagName('span');

    if (spans.length === 0) {
      return {
        text: p.textContent || '',
        start,
        end,
        syllables: [{ text: p.textContent || '', start, end }],
      };
    }

    const syllables = Array.from(spans)
      .filter(span => span.getAttribute('ttm:role') !== 'x-bg')
      .map((span, index, array) => {
        const text = span.textContent || '';
        const hasWhitespaceAfter = index < array.length - 1 && span.nextSibling && span.nextSibling.textContent?.trim() !== '';

        return {
          text: text + (hasWhitespaceAfter ? '' : '\u00a0'),
          start: parseTimeToSeconds(span.getAttribute('begin') || '0'),
          end: parseTimeToSeconds(span.getAttribute('end') || '0'),
        };
      });

    return {
      text: syllables.map(s => s.text).join(' '),
      start,
      end,
      syllables,
    };
  });
};

const parseTimeToSeconds = (time: string): number => {
  const parts = time.split(':');
  let seconds = 0;

  if (parts.length === 3) {
    seconds += parseFloat(parts[0]) * 3600;
    seconds += parseFloat(parts[1]) * 60;
    seconds += parseFloat(parts[2]);
  } else if (parts.length === 2) {
    // Format: MM:SS.SSS
    seconds += parseFloat(parts[0]) * 60;
    seconds += parseFloat(parts[1]);
  } else {
    // Format: SS.SSS
    seconds += parseFloat(parts[0]);
  }

  return seconds;
};

const lyricsCache: Record<string, { lyrics: LyricLine[], type: string }> = {};

export default function Lyrics({ musicsData, currentMusicIndex, onLyricClick, currentTime, youtubeId }: Props) {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [lyricsType, setLyricsType] = useState<string>('syllable');
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(0);
  const [isEmptyTerm, setIsEmptyTerm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const musicId = musicsData[currentMusicIndex].id;

    if (lyricsCache[musicId]) {
      setLyrics(lyricsCache[musicId].lyrics);
      setLyricsType(lyricsCache[musicId].type);
      setActiveLyricIndex(0);
      setIsEmptyTerm(false);
      setIsLoading(false);
      return;
    }

    setLyrics([]);
    setLyricsType('syllable');
    setActiveLyricIndex(0);
    setIsEmptyTerm(false);
    setIsLoading(true);

    const fetchLyrics = async () => {
      try {
        const response = await fetch(`https://yuntae.in/api/music/lyrics/${musicId}`);
        const data: any = await response.json();
        if (data.errors) {
          setLyricsType('none');
          lyricsCache[musicId] = { lyrics: [], type: 'none' };
          setIsLoading(false);
          return;
        }

        const parsedLyrics = parseTTML(data.data[0].attributes.ttml);
        let type = 'syllable';
        if (parsedLyrics[parsedLyrics.length - 1].end <= 0) { // syllable 가사 미지원 곡
          type = 'full';
        }

        setLyricsType(type);
        setLyrics(parsedLyrics);
        lyricsCache[musicId] = { lyrics: parsedLyrics, type };
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching lyrics:', error);
        setIsLoading(false);
      }
    };

    fetchLyrics();
  }, [currentMusicIndex, musicsData, youtubeId]);

  useEffect(() => {
    if (lyrics.length === 0 || isLoading) return;

    const newActiveIndex = lyrics.findIndex(
      (lyric, index) =>
        currentTime >= lyric.start &&
        (index === lyrics.length - 1 || currentTime < lyrics[index + 1].start)
    );
    setActiveLyricIndex(newActiveIndex);
    if (newActiveIndex === -1) {
      setIsEmptyTerm(true);
    } else {
      setIsEmptyTerm(false);
    }
  }, [currentTime, lyrics, isLoading]);

  const skipIntro = () => {
    const firstLyric = lyrics[0];
    const startTime = firstLyric.start;
    onLyricClick(startTime);
  };


  if (lyricsType === 'full') {
    return (
      <div className="mx-auto flex size-full min-h-0 flex-col items-center justify-center p-4">
        <motion.div
          key={activeLyricIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center font-black w-full flex-1 overflow-y-auto py-20 pr-4 styled-scrollbar"
          style={{ fontSize: '1.2rem', fontWeight: 600, wordBreak: 'keep-all', lineHeight: '2' }}
        >
          {lyrics.map((lyric, index) => (
            <motion.span key={index} className="opacity-80 hover:opacity-100 transition-opacity">
              {lyric.text}<br />
            </motion.span>
          ))}
        </motion.div>
      </div>
    )
  } else if (lyricsType === 'syllable') {
    return (
      <div className="styled-scrollbar mx-auto flex size-full flex-col items-center justify-center overflow-y-auto overflow-x-hidden p-4">
        <AnimatePresence>
          {isLoading && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="100" height="100">
              <circle fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" r="3" cx="15" cy="25">
                <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate>
              </circle>
              <circle fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" r="3" cx="26" cy="25">
                <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate>
              </circle>
              <circle fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" r="3" cx="37" cy="25">
                <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate>
              </circle>
            </svg>
          )}
          {!isLoading && isEmptyTerm && (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="100" height="100">
                <circle fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" r="3" cx="15" cy="25">
                  <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate>
                </circle>
                <circle fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" r="3" cx="26" cy="25">
                  <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate>
                </circle>
                <circle fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="2" r="3" cx="37" cy="25">
                  <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate>
                </circle>
              </svg>
              <button onClick={skipIntro} className='flex cursor-pointer items-center justify-center bg-white/10 px-14 py-6 active:scale-95 transition-all' style={{ fontSize: '13px', borderRadius: '10px' }}>건너뛰기</button>
            </>
          )}
          {!isLoading && lyrics[activeLyricIndex] && !isEmptyTerm && (
            <motion.div
              key={activeLyricIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center font-black"
              style={{ fontSize: '2rem', fontWeight: 900, wordBreak: 'keep-all' }}
            >
              {lyrics[activeLyricIndex]?.syllables?.map((syllable, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{
                    opacity: currentTime >= syllable.start ? 0.9 : 0,
                    y: currentTime >= syllable.start ? 0 : 5,
                  }}
                  transition={{ duration: 0.2 }}
                  className="inline-block"
                >
                  {index === (lyrics[activeLyricIndex]?.syllables ?? []).length - 1 ? syllable.text.trim() : syllable.text}
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  } else {
    return (
      <div className="mx-auto flex size-full flex-col items-center justify-center overflow-hidden p-4">

        <motion.div
          key={activeLyricIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.5, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center font-black"
          style={{ fontSize: '2rem', fontWeight: 900, wordBreak: 'keep-all' }}
        >
          가사 정보 없음
        </motion.div>
      </div>
    );
  }
}