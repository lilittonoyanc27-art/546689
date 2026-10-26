import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  MATH_PROBLEMS,
  MATH_CONNECTORS,
  MATH_VOCABULARY,
  MathProblem,
  MathOption,
  MathConnectorsGuide,
} from './mathProblems.ts';
import { sound, speakSpanish } from './soundEffects.ts';
import {
  Volume2,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Languages,
  Eye,
  EyeOff,
  Calculator,
  BookOpen,
  MessageSquare,
  Lightbulb,
  Award,
  Sparkles,
} from 'lucide-react';

export const MathGame: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'study' | 'speaking'>('quiz');

  // Quiz state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [score, setScore] = useState(0);

  // Translation toggles
  const [showQuestionArm, setShowQuestionArm] = useState(false);
  const [showOptionArm, setShowOptionArm] = useState<Record<string, boolean>>({});
  const [showAllTranslations, setShowAllTranslations] = useState(false);

  // Study mode filter & card expansions
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [studyExpandedSolutions, setStudyExpandedSolutions] = useState<Record<number, boolean>>({});
  const [studyArmToggles, setStudyArmToggles] = useState<Record<number, boolean>>({});

  // Speaking guide toggles
  const [speakingArmToggles, setSpeakingArmToggles] = useState<Record<string, boolean>>({});

  const currentProblem: MathProblem = MATH_PROBLEMS[currentIndex];
  const isFinished = currentIndex >= MATH_PROBLEMS.length;

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered) return;
    sound.playClick();
    setSelectedKey(key);
    setIsAnswered(true);

    const isCorrect = key === currentProblem.correctKey;
    if (isCorrect) {
      sound.playCorrect();
      setCorrectCount((prev) => prev + 1);
      setScore((prev) => prev + 50);
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.8 } });
    } else {
      sound.playWrong();
      setWrongCount((prev) => prev + 1);
    }
  };

  const handleNextProblem = () => {
    sound.playClick();
    if (currentIndex + 1 < MATH_PROBLEMS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedKey(null);
      setIsAnswered(false);
      setShowQuestionArm(showAllTranslations);
      setShowOptionArm(
        showAllTranslations ? { A: true, B: true, C: true, D: true } : {}
      );
    } else {
      setCurrentIndex(MATH_PROBLEMS.length);
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
    }
  };

  const handleRestartQuiz = () => {
    sound.playClick();
    setCurrentIndex(0);
    setSelectedKey(null);
    setIsAnswered(false);
    setCorrectCount(0);
    setWrongCount(0);
    setScore(0);
    setShowQuestionArm(false);
    setShowOptionArm({});
  };

  const toggleOptionArm = (key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();
    setShowOptionArm((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleAll = () => {
    sound.playClick();
    const nextVal = !showAllTranslations;
    setShowAllTranslations(nextVal);
    setShowQuestionArm(nextVal);
    setShowOptionArm({ A: nextVal, B: nextVal, C: nextVal, D: nextVal });
  };

  const filteredStudyProblems =
    selectedCategory === 'all'
      ? MATH_PROBLEMS
      : MATH_PROBLEMS.filter((p) => p.categoryEs === selectedCategory);

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4 text-white text-safe">
      {/* Sub-navigation tabs with Millionaire studio frame */}
      <div className="millionaire-box p-2 sm:p-3 rounded-2xl mb-5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('quiz');
            }}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'quiz'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/25'
                : 'text-indigo-200 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Calculator className="w-4 h-4 shrink-0" />
            <span>Թեստ (A2 • {MATH_PROBLEMS.length} խնդիր)</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('study');
            }}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'study'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/25'
                : 'text-indigo-200 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span>Բոլոր խնդիրները և լուծումները</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('speaking');
            }}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'speaking'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/25'
                : 'text-indigo-200 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Խոսակցական կանոն և արտահայտություններ</span>
          </button>
        </div>

        {activeTab === 'quiz' && !isFinished && (
          <button
            onClick={toggleAll}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showAllTranslations
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{showAllTranslations ? 'Թաքցնել հայերենը' : 'Բոլոր թարգմանությունները'}</span>
          </button>
        )}
      </div>

      {/* QUIZ MODE */}
      {activeTab === 'quiz' && (
        <>
          {isFinished ? (
            <div className="millionaire-box border-2 border-amber-400 rounded-3xl p-6 sm:p-10 shadow-2xl text-center">
              <Award className="w-16 h-16 text-amber-400 mx-auto mb-3" />
              <h2 className="text-2xl sm:text-3xl font-black gold-metallic-text mb-2 break-words">
                ¡ENHORABUENA! / ՀԻԱՆԱԼԻ Է
              </h2>
              <p className="text-slate-300 max-w-md mx-auto mb-6 text-sm leading-relaxed break-words font-['Noto_Sans_Armenian']">
                Դուք ավարտեցիք ֆուտբոլային մաթեմատիկայի A2 բոլոր {MATH_PROBLEMS.length} խնդիրները՝ նույնիսկ սխալվելու դեպքում շարունակելով խաղը։
              </p>

              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto mb-8">
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 min-w-0">
                  <div className="text-xs text-emerald-400 font-bold mb-1 truncate">Ճիշտ</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-300">{correctCount}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-rose-500/30 min-w-0">
                  <div className="text-xs text-rose-400 font-bold mb-1 truncate">Սխալ</div>
                  <div className="text-2xl sm:text-3xl font-black text-rose-300">{wrongCount}</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-amber-500/30 min-w-0">
                  <div className="text-xs text-amber-400 font-bold mb-1 truncate">Միավորներ</div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300">{score}</div>
                </div>
              </div>

              <button
                onClick={handleRestartQuiz}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-slate-950 font-black rounded-xl shadow-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Սկսել նորից / Reiniciar</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 min-w-0">
              {/* Progress & Category */}
              <div className="millionaire-box rounded-2xl p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 min-w-0">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
                    Խնդիր {currentProblem.id} / {MATH_PROBLEMS.length}
                  </span>
                  <span className="truncate">{currentProblem.categoryEs}</span>
                </div>
                <div className="text-xs font-semibold text-slate-300 shrink-0">
                  Միավորներ: <span className="text-emerald-400 font-bold font-mono">{score}</span>
                </div>
              </div>

              {/* Problem Card (Clicking on Spanish reveals Armenian) */}
              <div className="millionaire-box rounded-3xl p-4 sm:p-6 shadow-2xl min-w-0">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wide break-words">
                    {currentProblem.titleEs} • {currentProblem.titleArm}
                  </span>
                  <button
                    onClick={() => speakSpanish(currentProblem.problemEs)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors shrink-0"
                    title="Լսել իսպաներենով"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Spanish problem statement with click-to-translate */}
                <div
                  onClick={() => setShowQuestionArm((prev) => !prev)}
                  className="group cursor-pointer rounded-2xl p-3.5 sm:p-4 bg-slate-950/70 hover:bg-slate-900 border border-slate-700/70 hover:border-amber-400/70 transition-all min-w-0"
                  title="Սեղմիր իսպաներեն խնդրի վրա՝ հայերեն թարգմանությունը տեսնելու համար"
                >
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                      🇪🇸 Español
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-amber-300 flex items-center gap-1">
                      {showQuestionArm ? <EyeOff className="w-3 h-3 shrink-0" /> : <Eye className="w-3 h-3 shrink-0" />}
                      <span className="truncate">
                        {showQuestionArm ? 'Թաքցնել հայերենը' : 'Սեղմիր՝ հայերեն թարգմանելու համար'}
                      </span>
                    </span>
                  </div>

                  <p className="text-sm sm:text-base md:text-lg font-medium text-white group-hover:text-amber-100 transition-colors leading-relaxed break-words">
                    {currentProblem.problemEs}
                  </p>

                  {/* Revealed Armenian translation */}
                  {showQuestionArm && (
                    <div className="mt-3 pt-3 border-t border-slate-800 animate-in fade-in duration-150">
                      <span className="text-xs font-bold text-emerald-400 block mb-1">
                        🇦🇲 Հայերեն՝
                      </span>
                      <p className="text-xs sm:text-sm md:text-base font-normal text-emerald-200 font-['Noto_Sans_Armenian'] leading-relaxed break-words">
                        {currentProblem.problemArm}
                      </p>
                    </div>
                  )}
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {currentProblem.options.map((option: MathOption) => {
                    const isSelected = selectedKey === option.key;
                    const isCorrect = option.key === currentProblem.correctKey;
                    const isArmRevealed = showAllTranslations || !!showOptionArm[option.key];

                    let btnStyle = 'millionaire-box millionaire-box-hover text-white';

                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle = 'millionaire-box-correct text-white';
                      } else if (isSelected) {
                        btnStyle = 'millionaire-box-wrong text-white';
                      } else {
                        btnStyle = 'millionaire-box opacity-45 text-slate-400 border-slate-800';
                      }
                    }

                    return (
                      <div
                        key={option.key}
                        onClick={() => handleSelectOption(option.key)}
                        className={`group relative rounded-2xl border-2 p-3.5 transition-all flex flex-col justify-between cursor-pointer min-w-0 ${btnStyle}`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-black ${
                                isAnswered && isCorrect
                                  ? 'bg-emerald-500 text-slate-950'
                                  : isAnswered && isSelected
                                  ? 'bg-rose-500 text-white'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {option.key}
                            </span>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speakSpanish(option.textEs);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800"
                                title="Լսել իսպաներեն"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={(e) => toggleOptionArm(option.key, e)}
                                className="text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-300 font-bold"
                                title="Սեղմիր տարբերակի հայերեն թարգմանության համար"
                              >
                                🇦🇲 {isArmRevealed ? 'Թաքցնել' : 'Թարգմանել'}
                              </button>
                            </div>
                          </div>

                          <div className="text-sm font-semibold leading-snug break-words">
                            {option.textEs}
                          </div>
                        </div>

                        {isArmRevealed && (
                          <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-xs text-emerald-300 font-['Noto_Sans_Armenian'] leading-relaxed break-words animate-in fade-in">
                            {option.textArm}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation and Next Step (continues even if wrong!) */}
                {isAnswered && (
                  <div className="mt-4 p-4 rounded-2xl millionaire-box border-amber-500/50 animate-in fade-in min-w-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {selectedKey === currentProblem.correctKey ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0" />
                        )}
                        <span className="font-bold text-sm text-amber-300 break-words">
                          {selectedKey === currentProblem.correctKey
                            ? `Ճիշտ է! (+50 միավոր) — Պատասխան՝ ${currentProblem.answerSummaryEs}`
                            : `Սխալ է, բայց խաղը շարունակվում է: Ճիշտ պատասխանն էր՝ ${currentProblem.correctKey} (${currentProblem.answerSummaryEs})`}
                        </span>
                      </div>

                      <button
                        onClick={handleNextProblem}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 transition-all shrink-0"
                      >
                        <span>{currentIndex + 1 < MATH_PROBLEMS.length ? 'Հաջորդ խնդիրը' : 'Ավարտել'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-xs sm:text-sm bg-slate-950/80 p-3 rounded-xl border border-slate-800 break-words leading-relaxed">
                      <div>
                        <span className="font-bold text-rose-300">🇪🇸 Explicación: </span>
                        <span className="text-slate-200">{currentProblem.explanationEs}</span>
                      </div>
                      <div>
                        <span className="font-bold text-emerald-300">🇦🇲 Լուծում՝ </span>
                        <span className="text-emerald-100 font-['Noto_Sans_Armenian']">
                          {currentProblem.explanationArm}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* STUDY MODE (Browse all 20 problems with solutions) */}
      {activeTab === 'study' && (
        <div className="flex flex-col gap-4 min-w-0">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-2">
            {[
              { id: 'all', nameEs: `Todos (${MATH_PROBLEMS.length})` },
              { id: 'Parte 1. Sumas y restas', nameEs: '1. Sumas y restas' },
              { id: 'Parte 2. Multiplicaciones y divisiones', nameEs: '2. Mult. y divisiones' },
              { id: 'Parte 3. El tiempo', nameEs: '3. El tiempo' },
              { id: 'Parte 4. Problemas de lógica', nameEs: '4. Lógica' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {cat.nameEs}
              </button>
            ))}
          </div>

          <div className="space-y-3.5">
            {filteredStudyProblems.map((prob) => {
              const isArmOpen = !!studyArmToggles[prob.id];
              const isSolOpen = !!studyExpandedSolutions[prob.id];

              return (
                <div
                  key={prob.id}
                  className="millionaire-box rounded-2xl p-4 sm:p-5 shadow-lg min-w-0"
                >
                  <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs flex items-center justify-center shrink-0">
                        #{prob.id}
                      </span>
                      <h4 className="font-bold text-sm sm:text-base text-amber-300 truncate">
                        {prob.titleEs} — {prob.titleArm}
                      </h4>
                    </div>

                    <button
                      onClick={() => speakSpanish(prob.problemEs)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-slate-400 transition-colors shrink-0"
                      title="Լսել իսպաներենով"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Problem text - click to toggle translation */}
                  <div
                    onClick={() => {
                      sound.playClick();
                      setStudyArmToggles((prev) => ({ ...prev, [prob.id]: !prev[prob.id] }));
                    }}
                    className="p-3 sm:p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800 cursor-pointer transition-all min-w-0"
                    title="Սեղմիր հայերեն թարգմանության համար"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1 flex-wrap gap-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 shrink-0">
                        🇪🇸 Español (սեղմիր թարգմանելու համար)
                      </span>
                      <span className="text-[11px] text-amber-400">{isArmOpen ? 'Թաքցնել' : 'Տեսնել հայերեն'}</span>
                    </div>
                    <p className="text-sm sm:text-base text-white leading-relaxed break-words">{prob.problemEs}</p>

                    {isArmOpen && (
                      <div className="mt-2.5 pt-2.5 border-t border-slate-800 text-xs sm:text-sm text-emerald-300 font-['Noto_Sans_Armenian'] leading-relaxed break-words animate-in fade-in">
                        <span className="font-bold block text-emerald-400 text-xs mb-0.5">
                          🇦🇲 Հայերեն՝
                        </span>
                        {prob.problemArm}
                      </div>
                    )}
                  </div>

                  {/* Solution toggle */}
                  <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-emerald-400 truncate">
                      ✓ {prob.answerSummaryEs} ({prob.answerSummaryArm})
                    </span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setStudyExpandedSolutions((prev) => ({
                          ...prev,
                          [prob.id]: !prev[prob.id],
                        }));
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 hover:border-amber-400 flex items-center gap-1 font-bold shrink-0"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>{isSolOpen ? 'Փակել լուծումը' : 'Բացել քայլ առ քայլ լուծումը'}</span>
                    </button>
                  </div>

                  {isSolOpen && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5 text-xs sm:text-sm break-words leading-relaxed animate-in fade-in">
                      <div>
                        <span className="font-bold text-rose-300">🇪🇸 Explicación: </span>
                        <span className="text-slate-300">{prob.explanationEs}</span>
                      </div>
                      <div>
                        <span className="font-bold text-emerald-300">🇦🇲 Լուծում՝ </span>
                        <span className="text-emerald-200 font-['Noto_Sans_Armenian']">
                          {prob.explanationArm}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SPEAKING RULE & CONNECTORS TAB */}
      {activeTab === 'speaking' && (
        <div className="space-y-5 min-w-0">
          {/* Game Rule Card */}
          <div className="millionaire-box border-2 border-amber-400/80 rounded-3xl p-5 sm:p-6 shadow-2xl">
            <div className="flex items-center gap-2.5 mb-3">
              <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
              <h3 className="text-lg font-black gold-metallic-text">
                Խաղի կանոն / Regla del juego
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-['Noto_Sans_Armenian']">
              Աշակերտը նախ կարդում է խնդիրը իսպաներեն, այնուհետև բացատրում լուծումը նույնպես իսպաներենով՝ օգտագործելով{' '}
              <strong className="text-amber-300 font-bold">primero</strong> (նախ),{' '}
              <strong className="text-amber-300 font-bold">después</strong> (հետո),{' '}
              <strong className="text-amber-300 font-bold">porque</strong> (որովհետև),{' '}
              <strong className="text-amber-300 font-bold">en total</strong> (ընդհանուր) և{' '}
              <strong className="text-amber-300 font-bold">la respuesta es…</strong> (պատասխանն է…)։
            </p>

            {/* Speaking Connectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-4">
              {MATH_CONNECTORS.map((item: MathConnectorsGuide, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-700/80 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-amber-300 text-sm">{item.spanish}</span>
                    <button
                      onClick={() => speakSpanish(item.spanish)}
                      className="p-1 rounded text-slate-400 hover:text-amber-300"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-emerald-300 font-['Noto_Sans_Armenian'] mb-1">
                    {item.armenian}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-300">{item.usageEs}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Useful Math Expressions Table */}
          <div className="millionaire-box rounded-3xl p-4 sm:p-6 shadow-xl">
            <h4 className="text-base sm:text-lg font-bold text-amber-300 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Օգտակար մաթեմատիկական արտահայտություններ (16)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MATH_VOCABULARY.map((vocab, index) => {
                const isArm = !!speakingArmToggles[`vocab-${index}`];
                return (
                  <div
                    key={index}
                    onClick={() => {
                      sound.playClick();
                      setSpeakingArmToggles((prev) => ({
                        ...prev,
                        [`vocab-${index}`]: !prev[`vocab-${index}`],
                      }));
                    }}
                    className="p-3.5 rounded-2xl millionaire-box millionaire-box-hover cursor-pointer transition-all flex flex-col justify-between"
                    title="Սեղմիր թարգմանության համար"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-sm sm:text-base font-bold text-white break-words">
                          {vocab.spanish}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakSpanish(vocab.spanish);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-slate-800"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] text-amber-400 font-bold">
                            {isArm ? '🇦🇲 Թաքցնել' : '🇦🇲 Թարգմանել'}
                          </span>
                        </div>
                      </div>

                      {isArm && (
                        <div className="mt-2 pt-2 border-t border-slate-800 text-xs sm:text-sm text-emerald-300 font-['Noto_Sans_Armenian'] break-words animate-in fade-in">
                          {vocab.armenian}
                        </div>
                      )}
                    </div>

                    {vocab.exampleEs && (
                      <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-300 break-words">
                        <span className="text-rose-300 font-bold">Օրինակ՝ </span>
                        <span>{vocab.exampleEs}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
