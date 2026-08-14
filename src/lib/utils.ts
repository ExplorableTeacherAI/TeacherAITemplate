import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize a correct-answer spec into a list of accepted answers.
 *
 * Accepts either:
 * - an array of answers: `["first", "1", "1st"]`
 * - a single string, optionally pipe-separated: `"first | 1 | 1st"` or `"90"`
 *
 * Every alternate is trimmed; empty entries are dropped.
 */
export function normalizeCorrectAnswers(correctAnswer: string | string[]): string[] {
  const parts = Array.isArray(correctAnswer)
    ? correctAnswer.flatMap((a) => a.split('|'))
    : correctAnswer.split('|');
  return parts.map((a) => a.trim()).filter((a) => a !== '');
}

/**
 * Check a student's answer against one or more accepted answers.
 *
 * @param value          The student's raw input
 * @param correctAnswer  A single answer, pipe-separated alternates, or an array of answers
 * @param caseSensitive  Whether comparison is case-sensitive (default: false)
 */
export function isAnswerCorrect(
  value: string,
  correctAnswer: string | string[] | undefined | null,
  caseSensitive = false,
): boolean {
  if (correctAnswer === undefined || correctAnswer === null) return false;
  const user = caseSensitive ? value.trim() : value.trim().toLowerCase();
  return normalizeCorrectAnswers(correctAnswer).some(
    (ans) => user === (caseSensitive ? ans : ans.toLowerCase()),
  );
}
