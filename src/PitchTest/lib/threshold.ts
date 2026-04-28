// =============================================================================
// KORO KATILIM BARAJI — PARAMETRELER
// =============================================================================
// Bu dosyadaki değerleri değiştirerek baraj kriterlerini revize edebilirsin.
// Test sonucu bu kriterleri sağlamayan kişiler skor tablosuna eklenmez.
// =============================================================================

import type { TestResultRow } from './db';

export const CHOIR_THRESHOLD = {
  /** Notaları tutturma oranı (%): bu yüzdenin altındaki testler korozaya alınmaz. */
  minSuccessRate: 60,

  /** Ses aralığı genişliği (oktav): en az bu kadar oktav genişlik gerekiyor. */
  minOctaveWidth: 1.0,

  /** Ulaşılan başarılı nota sayısı: en az bu kadar nota tutturulmalı. */
  minSuccessfulNotes: 5,
} as const;

export type ThresholdResult = {
  passes: boolean;
  reasons: string[]; // başarısızlık nedenleri (passes=false ise)
  metrics: { successRate: number; octaveWidth: number; successfulNotes: number };
};

export function evaluateThreshold(result: TestResultRow): ThresholdResult {
  const reasons: string[] = [];
  const metrics = {
    successRate: result.successRate,
    octaveWidth: result.octaveRangeWidth,
    successfulNotes: result.successfulNotesCount,
  };

  if (result.successRate < CHOIR_THRESHOLD.minSuccessRate) {
    reasons.push(
      `Notaları tutturma oranı %${result.successRate.toFixed(0)} (gereken: %${CHOIR_THRESHOLD.minSuccessRate})`
    );
  }
  if (result.octaveRangeWidth < CHOIR_THRESHOLD.minOctaveWidth) {
    reasons.push(
      `Ses aralığı ${result.octaveRangeWidth.toFixed(1)} oktav (gereken: ${CHOIR_THRESHOLD.minOctaveWidth.toFixed(1)} oktav)`
    );
  }
  if (result.successfulNotesCount < CHOIR_THRESHOLD.minSuccessfulNotes) {
    reasons.push(
      `Başarılı nota sayısı ${result.successfulNotesCount} (gereken: ${CHOIR_THRESHOLD.minSuccessfulNotes})`
    );
  }

  return { passes: reasons.length === 0, reasons, metrics };
}

export function passesChoirThreshold(result: TestResultRow): boolean {
  return evaluateThreshold(result).passes;
}
