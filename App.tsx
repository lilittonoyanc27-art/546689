/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MillionaireGame } from './MillionaireGame.tsx';
import { MathGame } from './MathGame.tsx';
import { DialogueGame } from './DialogueGame.tsx';
import { VocabularyView } from './VocabularyView.tsx';
import { sound } from './soundEffects.ts';
import {
  Trophy,
  Calculator,
  MessageSquare,
  BookOpen,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
} from 'lucide-react';

export default function App() {
  const [activeGame, setActiveGame] = useState<'football' | 'math' | 'dialogue' | 'vocab'>('football');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showInfoBanner, setShowInfoBanner] = useState(true);

  const toggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    sound.enabled = nextVal;
    if (nextVal) sound.playClick();
  };

  const selectTab = (tab: 'football' | 'math' | 'dialogue' | 'vocab') => {
    sound.playClick();
    setActiveGame(tab);
  };

  return (
    <div className="min-h-screen millionaire-studio relative text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
      {/* Studio Stage Lighting & Floor Rings Overlay */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Overhead Spotlights */}
        <div className="absolute -top-32 left-0 w-2/3 h-[550px] studio-spotlight-left opacity-70 transform -skew-x-12" />
        <div className="absolute -top-32 right-0 w-2/3 h-[550px] studio-spotlight-right opacity-70 transform skew-x-12" />
        
        {/* Center Hot Seat Glow */}
        <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[520px] studio-center-glow rounded-full blur-2xl" />

        {/* Concentric Stage Rings */}
        <div className="absolute inset-0 studio-stage-rings opacity-60" />

        {/* Floating Ambient Sparks */}
        <div className="absolute top-10 left-10 w-2 h-2 rounded-full bg-amber-400/50 blur-[1px] animate-pulse" />
        <div className="absolute top-36 right-20 w-3 h-3 rounded-full bg-cyan-400/40 blur-[1px] animate-pulse" />
        <div className="absolute top-2/3 left-1/4 w-2 h-2 rounded-full bg-indigo-400/40 blur-[1px]" />
      </div>

      {/* Millionaire Studio Header */}
      <header className="relative z-20 border-b border-indigo-900/60 bg-slate-950/80 backdrop-blur-md sticky top-0 shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & Show Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 p-0.5 shadow-lg shadow-amber-500/30 ring-2 ring-yellow-400/60 flex items-center justify-center animate-pulse">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-black tracking-wide gold-metallic-text truncate">
                  ¿QUIÉN QUIERE SER MILLONARIO?
                </h1>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-sm shrink-0">
                  ES ⇄ ARM
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-indigo-200/90 font-['Noto_Sans_Armenian'] truncate">
                Ո՞վ է ուզում դառնալ միլիոնատեր • Ֆուտբոլ, Մաթեմատիկա և Երկխոսություններ
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap justify-center">
            <nav className="flex items-center p-1 rounded-2xl bg-slate-950/90 border border-slate-800/90 shadow-inner">
              <button
                onClick={() => selectTab('football')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                  activeGame === 'football'
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 scale-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <span>⚽</span>
                <span>Ֆուտբոլ (20)</span>
              </button>

              <button
                onClick={() => selectTab('math')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                  activeGame === 'math'
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 scale-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Մաթեմատիկա (19)</span>
              </button>

              <button
                onClick={() => selectTab('dialogue')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                  activeGame === 'dialogue'
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 scale-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Երկխոսություն (10)</span>
              </button>

              <button
                onClick={() => selectTab('vocab')}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
                  activeGame === 'vocab'
                    ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 scale-100'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Բառարան</span>
              </button>
            </nav>

            {/* Sound FX Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all ${
                soundEnabled
                  ? 'bg-amber-500/15 border-amber-400/50 text-amber-300 hover:bg-amber-500/25 shadow-md shadow-amber-500/10'
                  : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Անջատել ձայնը' : 'Միացնել ձայնը'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Instructions & Features Ribbon */}
      {showInfoBanner && (
        <div className="relative z-10 bg-gradient-to-r from-blue-950/80 via-slate-950/90 to-indigo-950/80 border-b border-indigo-500/20 px-3 sm:px-6 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 text-slate-200 text-safe">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px] sm:text-xs">
                <strong className="text-amber-300 font-bold">Կանոններ՝</strong> Սեղմիր իսպաներեն ցանկացած տողի կամ տարբերակի վրա՝ հայերեն թարգմանությունն առանձին բացելու համար: Լրացրու բաց թողնված բառերը և լսիր ճիշտ արտասանությունը:
              </span>
            </div>
            <button
              onClick={() => setShowInfoBanner(false)}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 text-[10px] sm:text-xs shrink-0 transition-colors"
            >
              ✕ Փակել
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Arena */}
      <main className="relative z-10 flex-1 py-4 sm:py-6 px-2 sm:px-4">
        {activeGame === 'football' && <MillionaireGame />}
        {activeGame === 'math' && <MathGame />}
        {activeGame === 'dialogue' && <DialogueGame />}
        {activeGame === 'vocab' && <VocabularyView />}
      </main>

      {/* Studio Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/90 py-3.5 px-4 text-center text-xs text-slate-400 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-safe">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-['Noto_Sans_Armenian'] text-slate-300">
              Իսպաներեն — Հայերեն ինտերակտիվ ուսումնական հարթակ (A1–B1)
            </span>
          </div>
          <div className="text-slate-500 text-[11px]">
            Ֆուտբոլային միլիոնատեր • Մաթեմատիկական խնդիրներ • Երկխոսություններ
          </div>
        </div>
      </footer>
    </div>
  );
}
