'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Props {
    currentMode: 'recent' | 'playlist' | 'specific';
}

export default function ModeDropdown({ currentMode }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const modes = [
        { id: 'recent', label: '최근 재생', path: '/' },
        { id: 'playlist', label: '플레이리스트', path: '/playlist' },
    ];

    const allModes = currentMode === 'specific'
        ? [...modes, { id: 'specific', label: '현재 곡', path: '#' }]
        : modes;

    return (
        <div className="fixed top-24 right-24 z-[100]">
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-8 bg-black/20 backdrop-blur-md px-16 py-8 rounded-full border border-white/10 text-white transition-all hover:bg-black/30 active:scale-95"
                    style={{ fontSize: '15px', fontWeight: 600 }}
                >
                    <span>{allModes.find(m => m.id === currentMode)?.label}</span>
                    <motion.svg
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        className="w-14 h-14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </motion.svg>
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            style={{ borderRadius: '20px' }}
                            className="absolute right-0 top-full mt-8 flex flex-col items-stretch overflow-hidden bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl min-w-[160px]"
                        >
                            {allModes.map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => {
                                        setIsOpen(false);
                                        if (mode.path !== '#') {
                                            router.push(mode.path);
                                        }
                                    }}
                                    className={`px-20 py-14 text-left transition-colors hover:bg-white/10 flex items-center justify-between ${mode.id === currentMode ? 'text-white' : 'text-white/60'}`}
                                    style={{ fontSize: '15px', fontWeight: mode.id === currentMode ? 700 : 500 }}
                                >
                                    {mode.label}
                                    {mode.id === currentMode && (
                                        <motion.div
                                            layoutId="active-indicator"
                                            className="w-6 h-6 rounded-full bg-white ml-2"
                                        />
                                    )}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
