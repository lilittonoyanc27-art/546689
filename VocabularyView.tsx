import React, { useState } from 'react';
import { EXTRA_FOOTBALL_EXPRESSIONS, ExtraExpression } from './footballQuestions.ts';
import { MATH_VOCABULARY, MathVocabItem } from './mathProblems.ts';
import { sound, speakSpanish } from './soundEffects.ts';
import {
  Volume2,
  Search,
  BookOpen,
  Sparkles,
  Layers,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';

export const VocabularyView: React.FC = () => {
  const [tab, setTab] = useState<'football' | 'math' | 'flashcards'>('football');
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedItems, setRevealedItems] = useState<Record<string, boolean>>({});

  // Flashcard practice state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleReveal = (key: string) => {
    sound.playClick();
    setRevealedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredFootball = EXTRA_FOOTBALL_EXPRESSIONS.filter(
    (item) =>
      item.spanish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.armenian.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMath = MATH_VOCABULARY.filter(
    (item) =>
      item.spanish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.armenian.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Combine for flashcards
  const allCards = [
    ...EXTRA_FOOTBALL_EXPRESSIONS.map((f) => ({
      es: f.spanish,
      arm: f.armenian,
      type: 'Ֆուտբոլ / Fútbol',
      note: f.contextArm || f.contextEs,
    })),
    ...MATH_VOCABULARY.map((m) => ({
      es: m.spanish,
      arm: m.armenian,
      type: 'Մաթեմատիկա / Matemáticas',
      note: m.exampleArm || m.exampleEs,
    })),
  ];

  const currentFlashcard = allCards[cardIndex % allCards.length];

  const nextFlashcard = () => {
    sound.playClick();
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % allCards.length);
  };

  const prevFlashcard = () => {
    sound.playClick();
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + allCards.length) % allCards.length);
  };

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4 text-white text-safe">
      {/* Tab Switcher & Search Bar */}
      <div className="millionaire-box rounded-3xl p-3 sm:p-4 mb-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto">
          <button
            onClick={() => {
              sound.playClick();
              setTab('football');
            }}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              tab === 'football'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/25'
                : 'text-indigo-200 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Ֆուտբոլային արտահայտություններ ({EXTRA_FOOTBALL_EXPRESSIONS.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTab('math');
            }}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              tab === 'math'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/25'
                : 'text-indigo-200 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Մաթեմատիկական բառարան ({MATH_VOCABULARY.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setTab('flashcards');
            }}
            className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              tab === 'flashcards'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/25'
                : 'text-indigo-200 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Քարտերով մարզում</span>
          </button>
        </div>

        {tab !== 'flashcards' && (
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Փնտրել իսպաներեն կամ հայերեն..."
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
            />
          </div>
        )}
      </div>

      {/* FOOTBALL EXPRESSIONS TAB */}
      {tab === 'football' && (
        <div className="min-w-0">
          <div className="mb-3 text-xs text-indigo-200/90 font-['Noto_Sans_Armenian']">
            💡 Սեղմիր յուրաքանչյուր իսպաներեն արտահայտության վրա՝ հայերեն թարգմանությունն ու բացատրությունը տեսնելու համար։
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredFootball.map((item: ExtraExpression, idx: number) => {
              const isRevealed = !!revealedItems[`football-${idx}`];

              return (
                <div
                  key={idx}
                  onClick={() => toggleReveal(`football-${idx}`)}
                  className="millionaire-box millionaire-box-hover rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between shadow-lg min-w-0"
                  title="Սեղմիր թարգմանության համար"
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                        🇪🇸 Español
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakSpanish(item.spanish);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800"
                          title="Լսել իսպաներենով"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-bold">
                          {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {isRevealed ? 'Թաքցնել' : 'Թարգմանել'}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-200 break-words">
                      {item.spanish}
                    </h4>
                  </div>

                  {isRevealed && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 animate-in fade-in">
                      <div className="text-sm font-semibold text-emerald-300 font-['Noto_Sans_Armenian'] break-words">
                        {item.armenian}
                      </div>
                      {item.contextArm && (
                        <div className="mt-1 text-xs text-slate-300 font-['Noto_Sans_Armenian'] break-words">
                          📌 {item.contextArm}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MATH VOCABULARY TAB */}
      {tab === 'math' && (
        <div className="min-w-0">
          <div className="mb-3 text-xs text-indigo-200/90 font-['Noto_Sans_Armenian']">
            💡 Սեղմիր յուրաքանչյուր մաթեմատիկական տերմինի վրա՝ հայերեն համարժեքը և օրինակը տեսնելու համար։
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredMath.map((item: MathVocabItem, idx: number) => {
              const isRevealed = !!revealedItems[`math-${idx}`];

              return (
                <div
                  key={idx}
                  onClick={() => toggleReveal(`math-${idx}`)}
                  className="millionaire-box millionaire-box-hover rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between shadow-lg min-w-0"
                  title="Սեղմիր թարգմանության համար"
                >
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                        🇪🇸 Matemáticas
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakSpanish(item.spanish);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800"
                          title="Լսել իսպաներենով"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-bold">
                          {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          {isRevealed ? 'Թաքցնել' : 'Թարգմանել'}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-200 break-words">
                      {item.spanish}
                    </h4>
                  </div>

                  {isRevealed && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 animate-in fade-in">
                      <div className="text-sm font-semibold text-emerald-300 font-['Noto_Sans_Armenian'] break-words">
                        {item.armenian}
                      </div>
                      {item.exampleEs && (
                        <div className="mt-1 text-xs text-slate-300 break-words leading-relaxed">
                          <span className="text-rose-300 font-bold">Օրինակ՝ </span>
                          <span>{item.exampleEs}</span>
                          {item.exampleArm && (
                            <span className="text-slate-400 block mt-0.5 font-['Noto_Sans_Armenian']">
                              {item.exampleArm}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FLASHCARDS TRAINING TAB */}
      {tab === 'flashcards' && (
        <div className="max-w-xl mx-auto flex flex-col items-center min-w-0">
          <div className="w-full flex justify-between items-center text-xs text-slate-300 mb-3 px-1">
            <span>
              Քարտ {cardIndex + 1} / {allCards.length}
            </span>
            <span className="text-amber-400 font-bold">{currentFlashcard.type}</span>
          </div>

          <div
            onClick={() => {
              sound.playClick();
              setIsFlipped((prev) => !prev);
            }}
            className="w-full min-h-[260px] millionaire-box border-2 border-amber-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between items-center text-center cursor-pointer shadow-2xl relative overflow-hidden transition-all hover:border-yellow-300 active:scale-[0.99] min-w-0"
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-xs px-2.5 py-1 rounded-full bg-slate-950 text-amber-300 font-bold border border-slate-800">
                {isFlipped ? '🇦🇲 Հայերեն' : '🇪🇸 Իսպաներեն'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakSpanish(currentFlashcard.es);
                }}
                className="p-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors"
                title="Լսել արտասանությունը"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="my-auto py-5 min-w-0 w-full px-2">
              {!isFlipped ? (
                <>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 break-words">
                    {currentFlashcard.es}
                  </h3>
                  <p className="text-xs text-amber-300/90 font-['Noto_Sans_Armenian']">
                    👆 Սեղմիր քարտի վրա՝ հայերեն թարգմանությունը տեսնելու համար
                  </p>
                </>
              ) : (
                <div className="animate-in fade-in duration-150 min-w-0">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-['Noto_Sans_Armenian'] mb-2 break-words">
                    {currentFlashcard.arm}
                  </h3>
                  {currentFlashcard.note && (
                    <p className="text-xs sm:text-sm text-slate-300 font-['Noto_Sans_Armenian'] max-w-sm mx-auto break-words leading-relaxed">
                      {currentFlashcard.note}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="text-[11px] text-slate-400 font-['Noto_Sans_Armenian']">
              Շրջելու համար սեղմիր ցանկացած տեղ
            </div>
          </div>

          {/* Flashcard Navigation */}
          <div className="flex items-center gap-3 sm:gap-4 mt-6 flex-wrap justify-center">
            <button
              onClick={prevFlashcard}
              className="px-4 sm:px-5 py-2.5 bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl transition-all text-xs sm:text-sm"
            >
              ⬅️ Նախորդը
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setIsFlipped((prev) => !prev);
              }}
              className="px-4 sm:px-5 py-2.5 bg-slate-900 hover:bg-slate-850 border border-amber-400 text-amber-300 font-bold rounded-xl transition-all text-xs sm:text-sm"
            >
              {isFlipped ? 'Տեսնել իսպաներենը' : 'Շրջել քարտը'}
            </button>
            <button
              onClick={nextFlashcard}
              className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black rounded-xl transition-all text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
            >
              <span>Հաջորդը</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
