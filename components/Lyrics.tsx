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
}

interface LyricLine {
  text: string;
  start: number;
  end: number;
  syllables: {
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

export default function Lyrics({ musicsData, currentMusicIndex, onLyricClick, currentTime }: Props) {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(0);
  const [isEmptyTerm, setIsEmptyTerm] = useState<boolean>(false);

  useEffect(() => {
    const fetchLyrics = async () => {
      try {
        const response = await fetch(`/api/lyrics/${musicsData[currentMusicIndex].id}`);
        const data: any = await response.json();
        const parsedLyrics = parseTTML(data.data[0].attributes.ttml);
        setLyrics(parsedLyrics);
        console.log('Lyrics:', parsedLyrics);
      } catch (error) {
        console.error('Error fetching lyrics:', error);
      }
    };

    fetchLyrics();
  }, [currentMusicIndex, musicsData]);

  useEffect(() => {
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
  }, [currentTime, lyrics]);

  const getActiveSyllables = (line: LyricLine) => {
    return line.syllables.filter(
      syllable => currentTime >= syllable.start && currentTime < syllable.end
    );
  };

  return (
    <div className="mx-auto flex size-full flex-col items-center justify-center overflow-hidden p-4">
      <AnimatePresence>
        {isEmptyTerm && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" width="100" height="100">
            <circle fill="#FFFFFF" stroke="#FFFFFF" stroke-width="2" r="3" cx="15" cy="25">
              <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate>
            </circle>
            <circle fill="#FFFFFF" stroke="#FFFFFF" stroke-width="2" r="3" cx="26" cy="25">
              <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate>
            </circle>
            <circle fill="#FFFFFF" stroke="#FFFFFF" stroke-width="2" r="3" cx="37" cy="25">
              <animate attributeName="opacity" calcMode="spline" dur="2" values="1;0;1;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate>
            </circle>
          </svg>
        )}
        {lyrics[activeLyricIndex] && !isEmptyTerm && (
          <motion.div
            key={activeLyricIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center font-black"
            style={{ fontSize: '2rem', fontWeight: 900 }}
          >
            {lyrics[activeLyricIndex].syllables.map((syllable, index) => (
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
                {syllable.text}
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}