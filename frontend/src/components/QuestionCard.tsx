import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { AnswerEvaluation, PublicQuestion } from '../types';
import { RefereeWhistleIcon } from './CourtMotifs';

interface QuestionCardProps {
  question: PublicQuestion;
  onAnswered?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswered }) => {
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEvaluation(null);
    setSubmittingId(null);
    setError(null);
  }, [question.id]);

  const handleSelectOption = async (optionId: number) => {
    setSubmittingId(optionId);
    setError(null);
    try {
      const result = await api.submitAnswer(question.id, optionId);
      setEvaluation(result);
      onAnswered?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to evaluate answer.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="bg-white border border-[#e6e5e0] rounded-xl p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#e6e5e0]">
        <span className="inline-flex items-center gap-2 text-xs font-mono-clock font-semibold uppercase tracking-wider text-[#f54e00]">
          <RefereeWhistleIcon size={15} />
          Official Call · {question.ruleReference}
        </span>
        <span className="bg-[#f7f7f4] border border-[#e6e5e0] text-[#26251e] rounded-full px-3 py-1 text-xs font-mono-clock font-medium">
          {question.difficulty}
        </span>
      </div>

      <h3 className="text-lg md:text-xl font-medium leading-snug text-[#26251e] mt-5 mb-6">
        {question.prompt}
      </h3>

      {error && (
        <div className="mb-4 p-3.5 rounded-lg border border-[#cf2d56] bg-[#fafaf7] text-xs font-medium text-[#cf2d56]">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {question.options.map((opt) => {
          const isSelected = evaluation?.selectedOptionId === opt.id;
          const isCorrect = isSelected && evaluation?.correct;

          let btnClass =
            'w-full text-left p-4 rounded-lg border text-sm font-medium transition-colors cursor-pointer flex items-center justify-between gap-3 ';
          if (!isSelected) {
            btnClass +=
              'bg-white border-[#cfcdc4] text-[#26251e] hover:bg-[#fafaf7] hover:border-[#26251e]';
          } else if (isCorrect) {
            btnClass += 'bg-[#1f8a65] border-[#1f8a65] text-white rounded-b-none';
          } else {
            btnClass += 'bg-[#cf2d56] border-[#cf2d56] text-white rounded-b-none';
          }

          return (
            <div key={opt.id}>
              <button
                type="button"
                disabled={submittingId !== null}
                onClick={() => handleSelectOption(opt.id)}
                className={btnClass}
              >
                <span className="leading-snug">{opt.optionLabel}</span>
                {isSelected && (
                  <span className="text-[11px] font-mono-clock font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#26251e] shrink-0">
                    {isCorrect ? 'CORRECT CALL' : 'WRONG CALL'}
                  </span>
                )}
              </button>

              {isSelected && evaluation && (
                <div
                  className={`border-x border-b rounded-b-lg bg-[#fafaf7] p-4 text-sm text-[#26251e] leading-relaxed ${
                    isCorrect ? 'border-[#1f8a65]' : 'border-[#cf2d56]'
                  }`}
                >
                  <div
                    className={`text-[11px] font-mono-clock font-semibold uppercase tracking-wider mb-1 ${
                      isCorrect ? 'text-[#1f8a65]' : 'text-[#cf2d56]'
                    }`}
                  >
                    {isCorrect
                      ? `Official Ruling Confirmed (${evaluation.ruleReference})`
                      : `Rulebook Violation / Misjudgment (${evaluation.ruleReference})`}
                  </div>
                  <div>{evaluation.explanation}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-5 border-t border-[#e6e5e0] flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-[#807d72]">
          Select any ruling above to reveal the Official FIBA / OBRI explanation immediately below it.
        </span>
        {evaluation && (
          <button
            type="button"
            onClick={() => setEvaluation(null)}
            className="text-xs font-medium text-[#f54e00] underline bg-transparent border-0 cursor-pointer"
          >
            Try Another Option
          </button>
        )}
      </div>
    </div>
  );
};
