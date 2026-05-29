import { PIP_QUESTIONS } from '../pipQuestions';

export function isFreeQuestion(questionId: string): boolean {
  return PIP_QUESTIONS.find((q) => q.id === questionId)?.free ?? false;
}

export function canAccessQuestion(questionId: string, hasPaid: boolean): boolean {
  return hasPaid || isFreeQuestion(questionId);
}

export function canAccessQuestionIndex(hasPaid: boolean): boolean {
  return hasPaid;
}
