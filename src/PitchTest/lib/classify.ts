// Composite skor — cinsiyet/aralık tarafsız, oktav-bazlı (logaritmik).
// Hz farkı kullanılmıyor çünkü kadın aralığı Hz cinsinden daha geniştir
// (Do4-Do5 = 262 Hz iken Do3-Do4 = 131 Hz — aynı 1 oktav).
export function compositeScore(_rangeWidthHz: number, octaveWidth: number, successfulNotes: number): number {
  // Oktav genişliği: 3 oktav (profesyonel) = full puan
  const rangeScore = Math.min((octaveWidth / 3) * 100, 100);
  // Başarılı nota sayısı: 20 başarılı = full
  const notesScore = Math.min(successfulNotes * 5, 100);
  return rangeScore * 0.7 + notesScore * 0.3;
}
