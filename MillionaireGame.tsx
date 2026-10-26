import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  FOOTBALL_QUESTIONS,
  FootballQuestion,
  FootballOption,
} from './footballQuestions.ts';
import { sound, speakSpanish } from './soundEffects.ts';
import {
  Volume2,
  HelpCircle,
  Users,
  Percent,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Languages,
  Eye,
  EyeOff,
  Trophy,
  Sparkles,
  Info,
} from 'lucide-react';

export const MillionaireGame: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [scoreEarned, setScoreEarned] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [userAnswersHistory, setUserAnswersHistory] = useState<
    { id: number; selected: 'A' | 'B' | 'C' | 'D'; isCorrect: boolean }[]
  >([]);

  // Per-item translation toggles
  const [showQuestionArm, setShowQuestionArm] = useState(false);
  const [showOptionArm, setShowOptionArm] = useState<Record<string, boolean>>({});
  const [showAllTranslations, setShowAllTranslations] = useState(false);

  // Lifelines
  const [lifeline5050Used, setLifeline5050Used] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [lifelineHintUsed, setLifelineHintUsed] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [lifelineAudienceUsed, setLifelineAudienceUsed] = useState(false);
  const [audiencePoll, setAudiencePoll] = useState<Record<string, number> | null>(null);
  const [showAudienceModal, setShowAudienceModal] = useState(false);

  // Mobile ladder modal
  const [showLadderModal, setShowLadderModal] = useState(false);

  const currentQ: FootballQuestion = FOOTBALL_QUESTIONS[currentIndex];
  const isFinished = currentIndex >= FOOTBALL_QUESTIONS.length;

  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered || disabledOptions.includes(key)) return;

    sound.playClick();
    setSelectedKey(key);
    setIsAnswered(true);

    const isCorrect = key === currentQ.correct;
    if (isCorrect) {
      sound.playCorrect();
      setScoreEarned(currentQ.prizeAmount);
      setCorrectCount((prev) => prev + 1);
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.75 },
      });
    } else {
      sound.playWrong();
      setWrongCount((prev) => prev + 1);
    }

    setUserAnswersHistory((prev) => [
      ...prev,
      { id: currentQ.id, selected: key, isCorrect },
    ]);
  };

  const handleNextQuestion = () => {
    sound.playClick();
    if (currentIndex + 1 < FOOTBALL_QUESTIONS.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedKey(null);
      setIsAnswered(false);
      setDisabledOptions([]);
      setShowQuestionArm(showAllTranslations);
      setShowOptionArm(
        showAllTranslations ? { A: true, B: true, C: true, D: true } : {}
      );
    } else {
      setCurrentIndex(FOOTBALL_QUESTIONS.length);
      confetti({
        particleCount: 150,
        spread: 110,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestart = () => {
    sound.playClick();
    setCurrentIndex(0);
    setSelectedKey(null);
    setIsAnswered(false);
    setScoreEarned(0);
    setCorrectCount(0);
    setWrongCount(0);
    setUserAnswersHistory([]);
    setLifeline5050Used(false);
    setLifelineHintUsed(false);
    setLifelineAudienceUsed(false);
    setDisabledOptions([]);
    setAudiencePoll(null);
    setShowQuestionArm(false);
    setShowOptionArm({});
  };

  const toggleQuestionTranslation = () => {
    sound.playClick();
    setShowQuestionArm((prev) => !prev);
  };

  const toggleOptionTranslation = (key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();
    setShowOptionArm((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleAllTranslations = () => {
    sound.playClick();
    const nextVal = !showAllTranslations;
    setShowAllTranslations(nextVal);
    setShowQuestionArm(nextVal);
    setShowOptionArm({
      A: nextVal,
      B: nextVal,
      C: nextVal,
      D: nextVal,
    });
  };

  // 50:50 lifeline
  const use5050 = () => {
    if (lifeline5050Used || isAnswered) return;
    sound.playLifeline();
    setLifeline5050Used(true);

    const incorrectOptions = currentQ.options
      .filter((opt) => opt.key !== currentQ.correct)
      .map((opt) => opt.key);
    const shuffled = [...incorrectOptions].sort(() => 0.5 - Math.random());
    setDisabledOptions([shuffled[0], shuffled[1]]);
  };

  // Hint lifeline
  const useHint = () => {
    if (lifelineHintUsed || isAnswered) return;
    sound.playLifeline();
    setLifelineHintUsed(true);
    setShowHintModal(true);
  };

  // Audience poll lifeline
  const useAudience = () => {
    if (lifelineAudienceUsed || isAnswered) return;
    sound.playLifeline();
    setLifelineAudienceUsed(true);

    const correctKey = currentQ.correct;
    const poll: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    const correctScore = Math.floor(Math.random() * 20) + 65;
    let remaining = 100 - correctScore;

    const wrongKeys = (['A', 'B', 'C', 'D'] as const).filter((k) => k !== correctKey);
    const part1 = Math.floor(Math.random() * (remaining - 4)) + 1;
    remaining -= part1;
    const part2 = Math.floor(Math.random() * (remaining - 2)) + 1;
    const part3 = remaining - part2;

    poll[correctKey] = correctScore;
    poll[wrongKeys[0]] = part1;
    poll[wrongKeys[1]] = part2;
    poll[wrongKeys[2]] = part3;

    setAudiencePoll(poll);
    setShowAudienceModal(true);
  };

  if (isFinished) {
    return (
      <div className="max-w-4xl mx-auto p-3 sm:p-6 text-white text-safe">
        <div className="millionaire-box border-2 border-amber-400/80 rounded-3xl p-6 sm:p-10 shadow-2xl text-center relative overflow-hidden">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 p-1 mb-5 shadow-xl shadow-amber-500/30">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 animate-bounce" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black gold-metallic-text mb-3 tracking-wide break-words">
            ¡FIN DEL JUEGO! / ԽԱՂՆ ԱՎԱՐՏՎԵՑ
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-6 text-sm sm:text-base leading-relaxed break-words font-['Noto_Sans_Armenian']">
            Դուք հաջողությամբ անցաք ֆուտբոլային բոլոր 20 հարցերը՝ նույնիսկ սխալվելու դեպքում շարունակելով խաղը և յուրացնելով կարևորագույն իսպաներեն արտահայտությունները։
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-2xl mx-auto mb-8">
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center min-w-0">
              <div className="text-xs uppercase font-bold text-emerald-400 mb-1 break-words">
                Ճիշտ պատասխաններ
              </div>
              <div className="text-3xl font-black text-emerald-300">
                {correctCount} <span className="text-sm text-slate-400">/ 20</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-center min-w-0">
              <div className="text-xs uppercase font-bold text-rose-400 mb-1 break-words">
                Սխալ պատասխաններ
              </div>
              <div className="text-3xl font-black text-rose-300">
                {wrongCount} <span className="text-sm text-slate-400">/ 20</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-center min-w-0">
              <div className="text-xs uppercase font-bold text-amber-400 mb-1 break-words">
                Վաստակած մրցանակ
              </div>
              <div className="text-2xl font-black text-amber-300 truncate">
                {scoreEarned.toLocaleString()} €
              </div>
            </div>
          </div>

          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl shadow-xl shadow-amber-500/30 active:scale-95 transition-all text-sm sm:text-base"
          >
            <RotateCcw className="w-5 h-5" />
            Խաղալ նորից / Jugar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 grid grid-cols-1 lg:grid-cols-4 gap-5 text-white text-safe">
      {/* Left/Center Column: Studio Arena & Question Board (3 cols) */}
      <div className="lg:col-span-3 flex flex-col gap-4 min-w-0">
        
        {/* Top Lifelines & Studio Control Bar */}
        <div className="millionaire-box rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl border border-indigo-900/60">
          
          {/* Authentic TV Lifelines */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* 50:50 Lifeline */}
            <button
              onClick={use5050}
              disabled={lifeline5050Used || isAnswered}
              title="50:50 — Հեռացնել 2 սխալ տարբերակ"
              className={`group relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black border-2 transition-all flex items-center gap-1.5 shrink-0 ${
                lifeline5050Used
                  ? 'opacity-35 bg-slate-900/60 border-slate-700 text-slate-500 line-through cursor-not-allowed'
                  : 'bg-gradient-to-b from-indigo-900 to-slate-950 border-amber-400/80 text-amber-300 hover:border-yellow-300 hover:text-white shadow-lg shadow-indigo-950/60 active:scale-95'
              }`}
            >
              <Percent className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform" />
              <span>50 : 50</span>
            </button>

            {/* Hint Lifeline */}
            <button
              onClick={useHint}
              disabled={lifelineHintUsed || isAnswered}
              title="Pista / Խորհուրդ — Լրացուցիչ ակնարկ"
              className={`group relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center gap-1.5 shrink-0 ${
                lifelineHintUsed
                  ? 'opacity-35 bg-slate-900/60 border-slate-700 text-slate-500 line-through cursor-not-allowed'
                  : 'bg-gradient-to-b from-indigo-900 to-slate-950 border-amber-400/80 text-amber-300 hover:border-yellow-300 hover:text-white shadow-lg shadow-indigo-950/60 active:scale-95'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span>Խորհուրդ</span>
            </button>

            {/* Audience Poll Lifeline */}
            <button
              onClick={useAudience}
              disabled={lifelineAudienceUsed || isAnswered}
              title="Voto del público — Հանդիսատեսի քվեարկություն"
              className={`group relative px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center gap-1.5 shrink-0 ${
                lifelineAudienceUsed
                  ? 'opacity-35 bg-slate-900/60 border-slate-700 text-slate-500 line-through cursor-not-allowed'
                  : 'bg-gradient-to-b from-indigo-900 to-slate-950 border-amber-400/80 text-amber-300 hover:border-yellow-300 hover:text-white shadow-lg shadow-indigo-950/60 active:scale-95'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Հանդիսատես</span>
              <span className="sm:hidden">Քվե</span>
            </button>
          </div>

          {/* Right Tools: Global Translate Toggle & Mobile Ladder Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleAllTranslations}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border-2 transition-all flex items-center gap-1.5 ${
                showAllTranslations
                  ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
              }`}
              title="Բացել կամ փակել բոլոր թարգմանությունները"
            >
              <Languages className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="truncate max-w-[150px] sm:max-w-none">
                {showAllTranslations ? 'Թաքցնել հայերենը' : 'Բոլոր թարգմանությունները'}
              </span>
            </button>

            <button
              onClick={() => setShowLadderModal(true)}
              className="lg:hidden px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 flex items-center gap-1 shadow-md shadow-amber-500/20"
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" />
              <span>{currentQ.prizeAmount.toLocaleString()} €</span>
            </button>
          </div>
        </div>

        {/* TV STUDIO QUESTION CONTAINER */}
        <div className="relative min-w-0">
          {/* Classic Horizontal Connector Beam for Question */}
          <div className="hidden sm:block absolute top-1/2 -left-3 -right-3 h-[2px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent -translate-y-1/2 pointer-events-none z-0" />

          {/* Question Box */}
          <div className="millionaire-box rounded-2xl sm:rounded-3xl border-2 border-indigo-400/40 p-4 sm:p-6 shadow-2xl relative z-10 overflow-hidden">
            {/* Top Bar inside Question: Step, Part Title, Prize */}
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-900/60 text-indigo-300 border border-indigo-500/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Հարց {currentQ.id} / 20 • {currentQ.partTitleEs}
              </span>
              <span className="text-sm sm:text-base font-black gold-metallic-text tracking-wider">
                {currentQ.prizeAmount.toLocaleString()} €
              </span>
            </div>

            {/* Question Text (Spanish + Click to Reveal Armenian) */}
            <div
              onClick={toggleQuestionTranslation}
              className="group cursor-pointer rounded-2xl p-3 sm:p-4 bg-slate-950/60 hover:bg-slate-900/80 border border-slate-700/80 hover:border-amber-400/80 transition-all duration-200"
              title="Սեղմիր իսպաներեն հարցի վրա՝ հայերեն թարգմանությունը տեսնելու համար"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                      🇪🇸 Español
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-amber-300 flex items-center gap-1">
                      {showQuestionArm ? <EyeOff className="w-3 h-3 shrink-0" /> : <Eye className="w-3 h-3 shrink-0" />}
                      <span className="truncate">
                        {showQuestionArm ? 'Թաքցնել թարգմանությունը' : 'Սեղմիր՝ հայերեն թարգմանելու համար'}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white group-hover:text-amber-100 transition-colors leading-relaxed break-words">
                    {currentQ.questionEs}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakSpanish(currentQ.questionEs);
                  }}
                  className="p-2 sm:p-2.5 rounded-xl bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-all shrink-0 self-start shadow-md"
                  title="Լսել իսպաներեն արտասանությունը"
                >
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              {/* Revealed Armenian Translation */}
              {showQuestionArm && (
                <div className="mt-3.5 pt-3.5 border-t border-slate-700/80 animate-in fade-in duration-150">
                  <span className="text-xs font-bold text-emerald-400 block mb-1">
                    🇦🇲 Հայերեն թարգմանություն՝
                  </span>
                  <p className="text-sm sm:text-lg font-medium text-emerald-200 leading-relaxed font-['Noto_Sans_Armenian'] break-words">
                    {currentQ.questionArm}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 MILLIONAIRE OPTION BOXES (A, B, C, D) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
          {currentQ.options.map((option: FootballOption) => {
            const isSelected = selectedKey === option.key;
            const isCorrectOption = option.key === currentQ.correct;
            const isDisabled = disabledOptions.includes(option.key);
            const isArmRevealed = showAllTranslations || !!showOptionArm[option.key];

            let boxClass = 'millionaire-box millionaire-box-hover text-white';

            if (isDisabled) {
              boxClass = 'bg-slate-950/40 border-slate-900 text-slate-600 opacity-20 cursor-not-allowed';
            } else if (isAnswered) {
              if (isCorrectOption) {
                boxClass = 'millionaire-box-correct text-white';
              } else if (isSelected) {
                boxClass = 'millionaire-box-wrong text-white';
              } else {
                boxClass = 'millionaire-box opacity-45 text-slate-400 border-slate-800';
              }
            }

            return (
              <div
                key={option.key}
                onClick={() => handleSelectOption(option.key)}
                className={`group relative rounded-2xl border-2 p-3.5 sm:p-4 transition-all duration-150 flex flex-col justify-between min-w-0 ${
                  isDisabled ? '' : 'cursor-pointer active:scale-[0.99]'
                } ${boxClass}`}
              >
                <div className="min-w-0">
                  {/* Top Bar of each option: Letter key & translation controls */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-black border ${
                          isAnswered && isCorrectOption
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/50'
                            : isAnswered && isSelected
                            ? 'bg-rose-500 border-rose-400 text-white shadow-md shadow-rose-500/50'
                            : 'bg-amber-500/20 border-amber-400/60 text-amber-300 group-hover:bg-amber-400 group-hover:text-slate-950'
                        }`}
                      >
                        {option.key}
                      </span>
                      <span className="text-amber-400 font-bold text-xs">◆</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Audio pronunciation for this option */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakSpanish(option.textEs);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800/80 transition-colors"
                        title="Լսել իսպաներեն"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Click to reveal Armenian translation for this specific option */}
                      <button
                        type="button"
                        onClick={(e) => toggleOptionTranslation(option.key, e)}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-bold border transition-all ${
                          isArmRevealed
                            ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-amber-400 hover:text-amber-300'
                        }`}
                        title="Սեղմիր տարբերակի հայերեն թարգմանության համար"
                      >
                        <span>🇦🇲 {isArmRevealed ? 'Թաքցնել' : 'Թարգմանել'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Spanish Text (carefully wrapped, no overflow!) */}
                  <div className="text-sm sm:text-base font-semibold leading-snug break-words">
                    {option.textEs}
                  </div>
                </div>

                {/* Armenian Translation Block for Option */}
                {isArmRevealed && (
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-xs sm:text-sm font-medium text-emerald-300 font-['Noto_Sans_Armenian'] leading-relaxed break-words animate-in fade-in duration-150">
                    {option.textArm}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FEEDBACK & CONTINUATION BANNER (Even if wrong, game continues!) */}
        {isAnswered && (
          <div
            className={`rounded-2xl border-2 p-4 sm:p-5 shadow-2xl transition-all animate-in fade-in duration-200 min-w-0 ${
              selectedKey === currentQ.correct
                ? 'millionaire-box-correct'
                : 'millionaire-box border-amber-500/60'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                {selectedKey === currentQ.correct ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-7 h-7 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="min-w-0">
                  <h4 className="text-base sm:text-lg font-black break-words">
                    {selectedKey === currentQ.correct ? (
                      <span className="text-emerald-300">
                        ¡Correcto! Ճիշտ պատասխան (+{currentQ.prizeAmount.toLocaleString()} €)
                      </span>
                    ) : (
                      <span className="text-amber-300">
                        Սխալ է, բայց դուք շարունակում եք խաղալ: Ճիշտ պատասխանն էր՝ {currentQ.correct}
                      </span>
                    )}
                  </h4>

                  {/* Football Expression explanation */}
                  <div className="mt-1.5 text-xs sm:text-sm text-slate-200 break-words leading-relaxed">
                    <span className="font-bold text-amber-400">
                      ⚽ Expresión:{' '}
                    </span>
                    <span className="font-bold text-white">{currentQ.expressionEs}</span>
                    <span className="text-slate-400 mx-1.5">—</span>
                    <span className="text-emerald-300 font-['Noto_Sans_Armenian']">
                      {currentQ.expressionArm}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <span>
                  {currentIndex + 1 < FOOTBALL_QUESTIONS.length
                    ? 'Հաջորդ հարցը'
                    : 'Տեսնել արդյունքը'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Authentic Millionaire Prize Ladder (Desktop) */}
      <div className="hidden lg:block lg:col-span-1 min-w-0">
        <div className="millionaire-box rounded-3xl p-3.5 shadow-2xl sticky top-20 border-2 border-indigo-900/60">
          <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-indigo-900/60">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 truncate">
              Մրցանակային սանդուղք
            </h3>
          </div>

          <div className="flex flex-col-reverse gap-1 text-xs">
            {FOOTBALL_QUESTIONS.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const isPast = idx < currentIndex;
              const pastRecord = userAnswersHistory.find((a) => a.id === q.id);

              let rowStyle = 'text-indigo-200/80 hover:bg-slate-900/40';
              let numStyle = 'text-amber-400 font-bold';

              if (isCurrent) {
                rowStyle =
                  'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 scale-[1.03] z-10';
                numStyle = 'text-slate-950 font-black';
              } else if (isPast) {
                if (pastRecord?.isCorrect) {
                  rowStyle = 'text-emerald-300 bg-emerald-950/50 border border-emerald-500/30';
                  numStyle = 'text-emerald-400 font-bold';
                } else {
                  rowStyle = 'text-rose-400/80 bg-rose-950/30 line-through opacity-65';
                  numStyle = 'text-rose-400 font-bold';
                }
              }

              return (
                <div
                  key={q.id}
                  className={`flex items-center justify-between px-2.5 py-1 rounded-lg transition-all min-w-0 ${rowStyle}`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`w-4 text-center ${numStyle}`}>
                      {q.id}
                    </span>
                    <span className="truncate text-[11px]">
                      {isPast ? (
                        pastRecord?.isCorrect ? (
                          <CheckCircle2 className="w-3 h-3 inline text-emerald-400 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 inline text-rose-400 mr-1" />
                        )
                      ) : (
                        `Հարց ${q.id}`
                      )}
                    </span>
                  </div>
                  <span className="font-mono font-bold shrink-0 ml-1">
                    {q.prizeAmount.toLocaleString()} €
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="millionaire-box border-2 border-amber-400 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl text-safe">
            <div className="flex items-center gap-2 text-amber-400 mb-3">
              <HelpCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-black gold-metallic-text">💡 Pista / Խորհուրդ</h3>
            </div>
            <div className="space-y-3 mb-5">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-700">
                <span className="text-xs text-rose-300 font-bold block mb-1">
                  🇪🇸 En español:
                </span>
                <p className="text-white text-sm leading-relaxed break-words">{currentQ.hintEs}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/40">
                <span className="text-xs text-emerald-300 font-bold block mb-1">
                  🇦🇲 Հայերեն:
                </span>
                <p className="text-emerald-100 text-sm font-['Noto_Sans_Armenian'] leading-relaxed break-words">
                  {currentQ.hintArm}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHintModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl transition-all"
            >
              Հասկացա / Entendido
            </button>
          </div>
        </div>
      )}

      {/* Audience Poll Modal */}
      {showAudienceModal && audiencePoll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="millionaire-box border-2 border-emerald-400 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl text-safe">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Users className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-black text-emerald-300">👥 Հանդիսատեսի քվեարկություն</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4 font-['Noto_Sans_Armenian']">
              Ստուդիայի հանդիսատեսի կարծիքը՝
            </p>

            <div className="space-y-3 mb-6">
              {(['A', 'B', 'C', 'D'] as const).map((key) => {
                const percent = audiencePoll[key] || 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-amber-300">Տարբերակ {key}</span>
                      <span className="text-white font-mono">{percent} %</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowAudienceModal(false)}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black rounded-xl transition-all"
            >
              Փակել / Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Mobile Ladder Modal */}
      {showLadderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md lg:hidden animate-in fade-in">
          <div className="millionaire-box border-2 border-amber-400 rounded-3xl p-5 max-w-sm w-full max-h-[85vh] flex flex-col shadow-2xl text-safe">
            <div className="flex items-center justify-between pb-3 border-b border-indigo-900/80 mb-3">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Մրցանակային սանդուղք</span>
              </div>
              <button
                onClick={() => setShowLadderModal(false)}
                className="text-slate-300 hover:text-white text-xs px-2.5 py-1 bg-slate-800 rounded-lg"
              >
                Փակել
              </button>
            </div>

            <div className="overflow-y-auto flex-1 flex flex-col-reverse gap-1 text-xs pr-1">
              {FOOTBALL_QUESTIONS.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isPast = idx < currentIndex;
                const pastRecord = userAnswersHistory.find((a) => a.id === q.id);

                let rowStyle = 'text-slate-300';
                if (isCurrent) {
                  rowStyle = 'bg-amber-500 text-slate-950 font-black';
                } else if (isPast) {
                  rowStyle = pastRecord?.isCorrect ? 'text-emerald-400' : 'text-rose-400 line-through opacity-70';
                }

                return (
                  <div
                    key={q.id}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg ${rowStyle}`}
                  >
                    <span>Հարց {q.id}</span>
                    <span className="font-mono font-bold">{q.prizeAmount.toLocaleString()} €</span>
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
