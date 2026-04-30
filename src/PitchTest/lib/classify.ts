// Composite skor — cinsiyet/aralık tarafsız, oktav-bazlı (logaritmik).
// Hz farkı kullanılmıyor çünkü kadın aralığı Hz cinsinden daha geniştir
// (Do4-Do5 = 262 Hz iken Do3-Do4 = 131 Hz — aynı 1 oktav).
//
// Üç bileşen:
//   - Aralık (oktav)    %50  — 3 oktav = full
//   - Doğruluk yüzdesi  %30  — denenmiş notalardan kaçının tutturulduğu
//   - Hacim (başarılı)  %20  — 20 başarılı nota = full (perseverans ödülü)
export function compositeScore(
  octaveWidth: number,
  successfulNotes: number,
  totalAttemptedNotes: number,
): number {
  const rangeScore = Math.min((octaveWidth / 3) * 100, 100);
  const accuracyScore = totalAttemptedNotes > 0 ? (successfulNotes / totalAttemptedNotes) * 100 : 0;
  const volumeScore = Math.min(successfulNotes * 5, 100);
  return rangeScore * 0.5 + accuracyScore * 0.3 + volumeScore * 0.2;
}
