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

export default function Lyrics({ musicsData, currentMusicIndex, onLyricClick, currentTime, youtubeId }: Props) {
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [lyricsType, setLyricsType] = useState<string>('syllable');
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(0);
  const [isEmptyTerm, setIsEmptyTerm] = useState<boolean>(false);
  const [generationStatus, setGenerationStatus] = useState<'not_started' | 'generating' | 'completed'>('not_started');
  const [generationProgress, setGenerationProgress] = useState<string>('');

  useEffect(() => {
    // Reset lyrics state when changing songs to avoid using previous song's data
    setLyrics([]);
    setLyricsType('syllable');
    setActiveLyricIndex(0);
    setIsEmptyTerm(false);
    setGenerationStatus('not_started');
    setGenerationProgress('');

    const fetchLyrics = async () => {
      try {
        const response = await fetch(`/api/proxy?url=https://yuntae.in/api/music/lyrics/${musicsData[currentMusicIndex].id}`);
        const data: any = await response.json();
        if (data.errors) {
          setLyricsType('none');

          const songId = musicsData[currentMusicIndex].id;
          try {
            const autoGenResponse = await fetch(`/api/lyrics/auto-generated?songId=${songId}`);
            if (autoGenResponse.ok) {
              const autoGenData = await autoGenResponse.json();
              setLyrics(autoGenData);
              setLyricsType('auto');
              setGenerationStatus('completed');
              return;
            }
          } catch (error) {
            console.error('Error fetching auto-generated lyrics:', error);
          }
          return;
        }

        const parsedLyrics = parseTTML(data.data[0].attributes.ttml);
        if (parsedLyrics[parsedLyrics.length - 1].end <= 0) { // syllable 가사 미지원 곡
          setLyricsType('full');

          const songId = musicsData[currentMusicIndex].id;
          try {
            const autoGenResponse = await fetch(`/api/lyrics/auto-generated?songId=${songId}`);
            if (autoGenResponse.ok) {
              const autoGenData = await autoGenResponse.json();
              setLyrics(autoGenData);
              console.log(autoGenData);
              setLyricsType('auto');
              setGenerationStatus('completed');
              return;
            }
          } catch (error) {
            console.error('Error fetching auto-generated lyrics:', error);
          }
        } else {
          setLyricsType('syllable');
        }
        setLyrics(parsedLyrics);
      } catch (error) {
        console.error('Error fetching lyrics:', error);
      }
    };

    fetchLyrics();
  }, [currentMusicIndex, musicsData, youtubeId]);

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

  const skipIntro = () => {
    const firstLyric = lyrics[0];
    const startTime = firstLyric.start;
    onLyricClick(startTime);
  };

  const generateLyrics = async () => {
    if (!youtubeId) {
      alert('YouTube 영상 정보를 찾을 수 없습니다.');
      return;
    }

    setGenerationStatus('generating');
    setGenerationProgress('가사 생성 시작 중...');

    const songId = musicsData[currentMusicIndex].id;
    const fullLyricsText = lyricsType === 'full' ? lyrics.map(lyric => lyric.text).join('\n') : '';

    try {
      // Create a streaming fetch request
      const response = await fetch(`/api/lyrics/generate?songId=${songId}&youtubeId=${youtubeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullLyrics: fullLyricsText
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      // Handle the streaming response
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      // Process the stream
      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode and process the chunk
          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            try {
              const update = JSON.parse(line);
              if (update.status === 'completed') {
                // When completed, fetch the generated lyrics
                const autoGenResponse = await fetch(`/api/lyrics/auto-generated?songId=${songId}`);
                if (autoGenResponse.ok) {
                  const autoGenData = await autoGenResponse.json();
                  setLyrics(autoGenData);
                  setLyricsType('auto');
                  setGenerationStatus('completed');
                }
              } else if (update.message) {
                setGenerationProgress(update.message);
              }
            } catch (e) {
              console.error('Error parsing streaming update:', e);
            }
          }
        }
      };

      processStream().catch(error => {
        console.error('Error processing stream:', error);
        setGenerationStatus('not_started');
      });
    } catch (error) {
      console.error('Error generating lyrics:', error);
      setGenerationStatus('not_started');
      alert('가사 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (lyricsType === 'full') {
    return (
      <div className="mx-auto flex size-full flex-col items-center justify-center overflow-hidden p-4">
        {generationStatus === 'not_started' && (
          <button
            onClick={generateLyrics}
            className="flex cursor-pointer items-center justify-center bg-white/10 px-12 py-6 active:scale-95 transition-all rounded-md hover:bg-white/20 mb-16"
            style={{ fontSize: '14px', borderRadius: '10px' }}
          >
            AI로 싱크 가사 생성
          </button>
        )}

        {generationStatus === 'generating' && (
          <span className="text-center mb-12 text-[0.8rem] max-w-[80%]">
            AI에게 싱크 가사 생성을 요청했어요.
          </span>
        )}

        <motion.div
          key={activeLyricIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center font-black w-full h-full overflow-y-auto"
          style={{ fontSize: '1rem', fontWeight: 600, wordBreak: 'keep-all' }}
        >
          {lyrics.map((lyric, index) => (
            <motion.span key={index}>
              {lyric.text}<br />
            </motion.span>
          ))}
        </motion.div>
      </div>
    )
  } else if (lyricsType === 'syllable') {
    return (
      <div className="mx-auto flex size-full flex-col items-center justify-center overflow-hidden p-4">
        <AnimatePresence>
          {isEmptyTerm && (
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
              <button onClick={skipIntro} className='flex cursor-pointer items-center justify-center bg-white/10 px-14 py-6 active:scale-95 transition-all' style={{ position: 'absolute', bottom: '200px', fontSize: '13px', borderRadius: '10px' }}>건너뛰기</button>
            </>
          )}
          {lyrics[activeLyricIndex] && !isEmptyTerm && (
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
  } else if (lyricsType === 'auto') {
    return (
      <div className="mx-auto flex size-full flex-col items-center justify-center overflow-hidden p-4">
        <AnimatePresence>
          {isEmptyTerm && (
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
              <button onClick={skipIntro} className='flex cursor-pointer items-center justify-center bg-white/10 px-14 py-6 active:scale-95 transition-all' style={{ position: 'absolute', bottom: '200px', fontSize: '13px', borderRadius: '10px' }}>건너뛰기</button>
            </>
          )}
          <motion.div
            key={activeLyricIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center font-black"
            style={{ fontSize: '2rem', fontWeight: 900, wordBreak: 'keep-all' }}
          >
            {lyrics[activeLyricIndex]?.text || ''}
          </motion.div>
        </AnimatePresence>

        {!isEmptyTerm && <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          className="text-center mt-4 text-[0.8rem] absolute bottom-[200px] max-w-[80%]"
          style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
        >
          AI가 자동 생성한 가사이므로 정확하지 않을 수 있어요.
        </motion.div>}
      </div>
    );
  } else {
    return (
      <div className="mx-auto flex size-full flex-col items-center justify-center overflow-hidden p-4">
        {generationStatus === 'not_started' && (
          <button
            onClick={generateLyrics}
            className="flex cursor-pointer items-center justify-center bg-white/10 px-12 py-6 active:scale-95 transition-all rounded-md hover:bg-white/20 mb-16"
            style={{ fontSize: '14px', borderRadius: '10px' }}
          >
            AI로 싱크 가사 생성
          </button>
        )}

        {generationStatus === 'generating' && (
          <div className="absolute top-4 flex items-center justify-center bg-white/10 px-6 py-3 rounded-md gap-2" style={{ fontSize: '14px' }}>
            <span className="inline-block mr-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {generationProgress}
          </div>
        )}

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