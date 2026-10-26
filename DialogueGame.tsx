import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { DIALOGUES, DialogueItem, DialogueLine } from './dialogueData.ts';
import { sound, speakSpanish } from './soundEffects.ts';
import {
  Volume2,
  CheckCircle2,
  RotateCcw,
  Languages,
  Eye,
  EyeOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  MessageSquare,
  Send,
  Lightbulb,
} from 'lucide-react';

export const DialogueGame: React.FC = () => {
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);

  // User selections: record of blankId -> selectedWord
  const [userSelections, setUserSelections] = useState<Record<string, string>>({});
  const [activeBlankId, setActiveBlankId] = useState<string | null>(null);

  // Line translation toggles (lineId -> boolean)
  const [lineArmToggles, setLineArmToggles] = useState<Record<string, boolean>>({});
  const [showAllLinesArm, setShowAllLinesArm] = useState(false);

  // Verification state
  const [isChecked, setIsChecked] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);

  // Dialogue 10 open continuation text
  const [continuationText, setContinuationText] = useState('');
  const [continuationSaved, setContinuationSaved] = useState(false);

  const currentDialogue: DialogueItem = DIALOGUES[currentDialogueIndex];

  // Helper to get all blank keys for current dialogue
  const blankKeys = Object.keys(currentDialogue.blanks);

  // Find remaining words in bank
  const usedWords = Object.values(userSelections);
  const availableWords = currentDialogue.wordBank.filter((word) => {
    const totalOccurrencesInBank = currentDialogue.wordBank.filter((w) => w === word).length;
    const totalUsed = usedWords.filter((w) => w.toLowerCase() === word.toLowerCase()).length;
    return totalUsed < totalOccurrencesInBank;
  });

  const handleSelectDialogue = (index: number) => {
    sound.playClick();
    setCurrentDialogueIndex(index);
    setUserSelections({});
    setActiveBlankId(null);
    setIsChecked(false);
    setAllCorrect(false);
    setLineArmToggles({});
    setShowAllLinesArm(false);
  };

  const handlePrevDialogue = () => {
    if (currentDialogueIndex > 0) {
      handleSelectDialogue(currentDialogueIndex - 1);
    }
  };

  const handleNextDialogue = () => {
    if (currentDialogueIndex + 1 < DIALOGUES.length) {
      handleSelectDialogue(currentDialogueIndex + 1);
    }
  };

  // Tapping a word from word bank
  const handleWordChipClick = (word: string) => {
    sound.playClick();

    // If a specific blank is focused, put it there
    if (activeBlankId) {
      setUserSelections((prev) => ({
        ...prev,
        [activeBlankId]: word,
      }));
      // Advance to next empty blank
      const nextEmpty = blankKeys.find(
        (key) => key !== activeBlankId && (!userSelections[key] || userSelections[key] === '')
      );
      setActiveBlankId(nextEmpty || null);
      setIsChecked(false);
      return;
    }

    // Otherwise find the first empty blank
    const firstEmpty = blankKeys.find((key) => !userSelections[key]);
    if (firstEmpty) {
      setUserSelections((prev) => ({
        ...prev,
        [firstEmpty]: word,
      }));
      // Advance focus
      const nextEmpty = blankKeys.find(
        (key) => key !== firstEmpty && !userSelections[key]
      );
      setActiveBlankId(nextEmpty || null);
      setIsChecked(false);
    }
  };

  // Tapping a gap inside the dialogue
  const handleGapClick = (blankId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();

    if (userSelections[blankId]) {
      // Remove word from blank
      setUserSelections((prev) => {
        const copy = { ...prev };
        delete copy[blankId];
        return copy;
      });
      setActiveBlankId(blankId);
      setIsChecked(false);
    } else {
      // Set as active blank to receive next tapped chip
      setActiveBlankId(blankId);
    }
  };

  const handleCheckAnswers = () => {
    sound.playClick();
    setIsChecked(true);

    let isSuccess = true;
    for (const key of blankKeys) {
      const correct = currentDialogue.blanks[key]?.toLowerCase().trim();
      const user = userSelections[key]?.toLowerCase().trim();
      if (user !== correct) {
        isSuccess = false;
        break;
      }
    }

    setAllCorrect(isSuccess);
    if (isSuccess) {
      sound.playCorrect();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.75 },
      });
    } else {
      sound.playWrong();
    }
  };

  const handleRevealAllAnswers = () => {
    sound.playClick();
    const correctMap: Record<string, string> = {};
    for (const key of blankKeys) {
      correctMap[key] = currentDialogue.blanks[key];
    }
    setUserSelections(correctMap);
    setIsChecked(true);
    setAllCorrect(true);
  };

  const handleResetDialogue = () => {
    sound.playClick();
    setUserSelections({});
    setActiveBlankId(null);
    setIsChecked(false);
    setAllCorrect(false);
  };

  const toggleLineTranslation = (lineId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playClick();
    setLineArmToggles((prev) => ({
      ...prev,
      [lineId]: !prev[lineId],
    }));
  };

  const toggleAllLineTranslations = () => {
    sound.playClick();
    const nextVal = !showAllLinesArm;
    setShowAllLinesArm(nextVal);
    const toggles: Record<string, boolean> = {};
    currentDialogue.lines.forEach((l) => {
      toggles[l.id] = nextVal;
    });
    setLineArmToggles(toggles);
  };

  const speakEntireDialogue = () => {
    sound.playClick();
    const fullText = currentDialogue.lines
      .map((l) => {
        let text = l.textEs;
        // replace {b1}, etc. with current selection or correct word
        for (const [bId, target] of Object.entries(currentDialogue.blanks)) {
          const filled = userSelections[bId] || target;
          text = text.replace(`{${bId}}`, filled);
        }
        return text.replace(/^[—–-]\s*/, '');
      })
      .join('. ');
    speakSpanish(fullText);
  };

  // Render a dialogue line with inline interactive blank slots
  const renderDialogueLine = (line: DialogueLine) => {
    const isArmOpen = showAllLinesArm || !!lineArmToggles[line.id];
    let templateEs = line.textEs;

    // Split template around placeholders like {b1}, {b2}
    const parts = templateEs.split(/(\{b\d+\})/g);

    return (
      <div
        key={line.id}
        onClick={() => toggleLineTranslation(line.id)}
        className="p-3 sm:p-4 rounded-2xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-400/60 transition-all cursor-pointer min-w-0"
        title="Սեղմիր այս արտահայտության վրա՝ հայերեն թարգմանությունը բացելու համար"
      >
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex-1 min-w-0">
            <div className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed break-words flex flex-wrap items-baseline gap-1.5">
              {parts.map((part, pIdx) => {
                const match = part.match(/\{([a-z0-9_]+)\}/);
                if (match) {
                  const blankId = match[1];
                  const filledVal = userSelections[blankId];
                  const isFocused = activeBlankId === blankId;
                  const isCorrect =
                    isChecked &&
                    filledVal?.toLowerCase().trim() ===
                      currentDialogue.blanks[blankId]?.toLowerCase().trim();
                  const isWrong = isChecked && !isCorrect;

                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={(e) => handleGapClick(blankId, e)}
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-xl text-xs sm:text-sm font-black transition-all border-2 align-middle ${
                        isFocused
                          ? 'bg-amber-500 text-slate-950 border-yellow-300 ring-2 ring-yellow-400 shadow-md scale-105'
                          : isChecked && isCorrect
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/20'
                          : isChecked && isWrong
                          ? 'bg-rose-700 text-white border-rose-400 shadow-md shadow-rose-500/20 animate-shake'
                          : filledVal
                          ? 'bg-indigo-900/90 text-amber-200 border-amber-400/80 hover:border-yellow-300'
                          : 'bg-slate-900 text-slate-400 border-dashed border-amber-400/50 hover:border-amber-400 hover:text-white min-w-[70px] sm:min-w-[85px]'
                      }`}
                      title={
                        filledVal
                          ? `Սեղմիր՝ «${filledVal}» բառը հեռացնելու համար`
                          : 'Սեղմիր՝ այս դաշտը լրացնելու համար'
                      }
                    >
                      {filledVal || '____'}
                    </button>
                  );
                }

                return (
                  <span key={pIdx} className="break-words">
                    {part}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                // Replace blanks with current filled or correct words for pronunciation
                let speech = line.textEs;
                for (const [bId, target] of Object.entries(currentDialogue.blanks)) {
                  speech = speech.replace(`{${bId}}`, userSelections[bId] || target);
                }
                speakSpanish(speech);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
              title="Լսել արտասանությունը"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            <span className="text-[11px] text-amber-400/80 font-bold hidden sm:inline">
              {isArmOpen ? '🇦🇲 Թաքցնել' : '🇦🇲 Թարգմանել'}
            </span>
          </div>
        </div>

        {/* Revealed Armenian Line */}
        {isArmOpen && (
          <div className="mt-2.5 pt-2 border-t border-slate-800 text-xs sm:text-sm text-emerald-300 font-['Noto_Sans_Armenian'] leading-relaxed break-words animate-in fade-in duration-150">
            {line.textArm.replace(/\{b\d+\}/g, '_____')}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4 text-white text-safe">
      {/* Top Header & Dialogue Selector */}
      <div className="millionaire-box rounded-3xl p-4 sm:p-5 mb-5 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50">
              Diálogos con huecos • Nivel {currentDialogue.level}
            </span>
            <span className="text-xs text-indigo-300 font-bold">
              Երկխոսություն {currentDialogue.id} / 10
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black gold-metallic-text break-words">
            {currentDialogue.titleEs}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-['Noto_Sans_Armenian'] break-words">
            {currentDialogue.titleArm} — {currentDialogue.contextArm}
          </p>
        </div>

        {/* Dialogue Navigation Buttons */}
        <div className="flex items-center gap-2 self-stretch md:self-auto justify-between sm:justify-end shrink-0">
          <button
            onClick={handlePrevDialogue}
            disabled={currentDialogueIndex === 0}
            className={`p-2.5 rounded-xl border font-bold flex items-center gap-1 transition-all ${
              currentDialogueIndex === 0
                ? 'opacity-30 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-900 border-slate-700 text-white hover:border-amber-400 hover:text-amber-300'
            }`}
            title="Նախորդ երկխոսությունը"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Quick Dropdown / Carousel Indicator */}
          <select
            value={currentDialogueIndex}
            onChange={(e) => handleSelectDialogue(Number(e.target.value))}
            className="bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-amber-400"
          >
            {DIALOGUES.map((d, idx) => (
              <option key={d.id} value={idx} className="bg-slate-900 text-white">
                {d.id}. {d.titleEs.replace(/^\d+\.\s*/, '')}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextDialogue}
            disabled={currentDialogueIndex === DIALOGUES.length - 1}
            className={`p-2.5 rounded-xl border font-bold flex items-center gap-1 transition-all ${
              currentDialogueIndex === DIALOGUES.length - 1
                ? 'opacity-30 border-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-slate-900 border-slate-700 text-white hover:border-amber-400 hover:text-amber-300'
            }`}
            title="Հաջորդ երկխոսությունը"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* WORD BANK STAGE (Selectable Chips) */}
      <div className="millionaire-box rounded-2xl p-4 sm:p-5 mb-5 shadow-xl border-2 border-indigo-900/80">
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
              Palabras para completar / Ընտրիր բառերը՝
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Սեղմիր բառի վրա՝ այն դատարկ վայրում տեղադրելու համար
          </span>
        </div>

        {/* Word Chips */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {currentDialogue.wordBank.map((word, wIdx) => {
            const isWordUsed = usedWords.includes(word);

            return (
              <button
                key={wIdx}
                type="button"
                onClick={() => handleWordChipClick(word)}
                className={`group px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center gap-2 ${
                  isWordUsed
                    ? 'bg-slate-900/60 border-slate-800 text-slate-500 opacity-40 line-through'
                    : 'bg-gradient-to-b from-indigo-900/90 to-slate-950 border-amber-400/80 text-amber-300 hover:border-yellow-300 hover:text-white shadow-md shadow-indigo-950/50 active:scale-95'
                }`}
              >
                <span>{word}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    speakSpanish(word);
                  }}
                  className="opacity-70 group-hover:opacity-100 hover:text-amber-400"
                  title="Լսել բառը"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DIALOGUE LINES BOARD */}
      <div className="millionaire-box rounded-3xl p-4 sm:p-6 mb-5 shadow-2xl space-y-3 min-w-0">
        {/* Controls bar above dialogue */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-indigo-900/60 flex-wrap">
          <button
            onClick={speakEntireDialogue}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 hover:text-amber-300 hover:border-amber-400 flex items-center gap-1.5 transition-all"
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>Լսել ամբողջ երկխոսությունը</span>
          </button>

          <button
            onClick={toggleAllLineTranslations}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              showAllLinesArm
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{showAllLinesArm ? 'Թաքցնել հայերենը' : 'Բացել բոլոր թարգմանությունները'}</span>
          </button>
        </div>

        {/* Lines */}
        <div className="space-y-2.5">
          {currentDialogue.lines.map((line) => renderDialogueLine(line))}
        </div>

        {/* Action Controls: Verify / Reveal / Reset */}
        <div className="pt-4 mt-2 border-t border-indigo-900/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCheckAnswers}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-xs sm:text-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Ստուգել պատասխանները</span>
            </button>

            <button
              onClick={handleRevealAllAnswers}
              className="px-4 py-2.5 bg-slate-900 border border-slate-700 hover:border-amber-400 text-amber-300 font-bold rounded-xl text-xs sm:text-sm transition-all"
            >
              <span>Ցույց տալ ճիշտ տարբերակները</span>
            </button>
          </div>

          <button
            onClick={handleResetDialogue}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Մաքրել</span>
          </button>
        </div>

        {/* Result Feedback Banner */}
        {isChecked && (
          <div
            className={`mt-4 p-4 rounded-2xl border-2 transition-all animate-in fade-in ${
              allCorrect
                ? 'millionaire-box-correct'
                : 'millionaire-box border-amber-500/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {allCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <Lightbulb className="w-6 h-6 text-amber-400 shrink-0" />
              )}
              <div>
                <h4 className="font-bold text-sm sm:text-base">
                  {allCorrect ? (
                    <span className="text-emerald-300">
                      ¡Excelente! Բոլոր բառերը ճիշտ են տեղադրված։
                    </span>
                  ) : (
                    <span className="text-amber-300">
                      Որոշ բառեր դեռ ճիշտ չեն։ Կարմիր նշված բառերը կարող ես փոխել կամ սեղմել «Ցույց տալ ճիշտ տարբերակները»։
                    </span>
                  )}
                </h4>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DIALOGUE 10: INTERACTIVE CONTINUATION (Պատասխանիր և շարունակիր) */}
      {currentDialogue.hasOpenEnding && (
        <div className="millionaire-box rounded-3xl p-5 sm:p-6 mb-5 shadow-2xl border-2 border-amber-400/80">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-base sm:text-lg font-black gold-metallic-text">
              Շարունակիր երկխոսությունը / Continúa el diálogo
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 font-['Noto_Sans_Armenian'] mb-3">
            Ի՞նչ կպատասխանեիր «¿Y qué harías si un amigo te pidiera ayuda?» հարցին։ Գրիր կամ կազմիր 3–4 նախադասություն իսպաներենով։
          </p>

          {/* Quick suggestion phrases */}
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              'Le ayudaría inmediatamente.',
              'Iría a su casa para hablar con él.',
              'Haría todo lo posible para solucionarlo.',
              'Le escucharía con mucha atención.',
            ].map((phrase, pIdx) => (
              <button
                key={pIdx}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setContinuationText((prev) => (prev ? `${prev} ${phrase}` : phrase));
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:border-amber-400 hover:text-amber-300 transition-all text-left"
              >
                + {phrase}
              </button>
            ))}
          </div>

          <textarea
            value={continuationText}
            onChange={(e) => setContinuationText(e.target.value)}
            rows={3}
            placeholder="Escribe tu respuesta aquí en español (օրինակ՝ Si un amigo me pidiera ayuda, yo...)"
            className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />

          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <button
              onClick={() => {
                if (continuationText) {
                  speakSpanish(continuationText);
                }
              }}
              disabled={!continuationText}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-amber-300 hover:border-amber-400 flex items-center gap-1.5 disabled:opacity-40"
            >
              <Volume2 className="w-4 h-4" />
              <span>Լսել իմ գրածը</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setContinuationSaved(true);
              }}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-1.5 shadow-md"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Պահպանել պատասխանը</span>
            </button>
          </div>

          {continuationSaved && (
            <div className="mt-2 text-xs text-emerald-400 font-bold font-['Noto_Sans_Armenian'] animate-in fade-in">
              ✓ Քո պատասխանը պահպանված է։ Փորձիր այն նաև բարձրաձայն արտասանել։
            </div>
          )}
        </div>
      )}

      {/* ORAL CHALLENGE CARD */}
      <div className="millionaire-box rounded-3xl p-4 sm:p-5 shadow-xl border border-indigo-900/60">
        <div className="flex items-center gap-2.5 mb-2">
          <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <h4 className="text-sm sm:text-base font-bold text-amber-300">
            Լրացուցիչ բանավոր առաջադրանք / Desafío oral
          </h4>
        </div>
        <p className="text-xs sm:text-sm text-slate-200 font-['Noto_Sans_Armenian'] leading-relaxed mb-2">
          {currentDialogue.oralChallengeArm}
        </p>
        <p className="text-xs text-indigo-300 font-medium">
          💡 <strong>Regla:</strong> {currentDialogue.oralChallengeEs}
        </p>
      </div>
    </div>
  );
};
