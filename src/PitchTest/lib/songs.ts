export type Song = {
  title: string;
  artist: string;
  minFreq: number;
  maxFreq: number;
  genre: string;
};

export const SONG_DATABASE: Song[] = [
  { title: 'Hallelujah', artist: 'Leonard Cohen', minFreq: 98.0, maxFreq: 330.0, genre: 'Folk' },
  { title: 'The Sound of Silence', artist: 'Simon & Garfunkel', minFreq: 110.0, maxFreq: 350.0, genre: 'Folk' },
  { title: 'Yesterday', artist: 'The Beatles', minFreq: 123.47, maxFreq: 369.99, genre: 'Pop' },
  { title: 'Mad World', artist: 'Gary Jules', minFreq: 98.0, maxFreq: 293.66, genre: 'Alternative' },
  { title: 'Imagine', artist: 'John Lennon', minFreq: 130.81, maxFreq: 493.88, genre: 'Pop' },
  { title: 'Let It Be', artist: 'The Beatles', minFreq: 146.83, maxFreq: 523.25, genre: 'Pop' },
  { title: 'Wonderwall', artist: 'Oasis', minFreq: 164.81, maxFreq: 587.33, genre: 'Rock' },
  { title: 'Someone Like You', artist: 'Adele', minFreq: 196.0, maxFreq: 523.25, genre: 'Pop' },
  { title: 'Hello', artist: 'Adele', minFreq: 174.61, maxFreq: 587.33, genre: 'Pop' },
  { title: 'Tears in Heaven', artist: 'Eric Clapton', minFreq: 220.0, maxFreq: 440.0, genre: 'Ballad' },
  { title: 'I Will Always Love You', artist: 'Whitney Houston', minFreq: 261.63, maxFreq: 1046.5, genre: 'R&B' },
  { title: 'My Heart Will Go On', artist: 'Celine Dion', minFreq: 293.66, maxFreq: 880.0, genre: 'Pop' },
  { title: 'Amazing Grace', artist: 'Traditional', minFreq: 261.63, maxFreq: 698.46, genre: 'Spiritual' },
  { title: 'Happy Birthday', artist: 'Traditional', minFreq: 130.81, maxFreq: 523.25, genre: 'Geleneksel' },
  { title: 'Auld Lang Syne', artist: 'Traditional', minFreq: 146.83, maxFreq: 440.0, genre: 'Geleneksel' },
];

export type SongMatch = Song & {
  coverage: number;
  difficulty: 'Çok Kolay' | 'Kolay' | 'Orta' | 'Zor' | 'Çok Zor';
};

function difficultyFor(songRange: number, userRange: number): SongMatch['difficulty'] {
  const ratio = (songRange / Math.max(userRange, 1)) * 100;
  if (ratio <= 50) return 'Çok Kolay';
  if (ratio <= 70) return 'Kolay';
  if (ratio <= 90) return 'Orta';
  if (ratio <= 110) return 'Zor';
  return 'Çok Zor';
}

export function recommendSongs(userMinFreq: number, userMaxFreq: number, threshold = 70): SongMatch[] {
  const userRange = userMaxFreq - userMinFreq;
  if (userRange <= 0) return [];

  return SONG_DATABASE
    .map((song) => {
      const overlap = Math.max(0, Math.min(song.maxFreq, userMaxFreq) - Math.max(song.minFreq, userMinFreq));
      const coverage = (overlap / userRange) * 100;
      const songRange = song.maxFreq - song.minFreq;
      return { ...song, coverage, difficulty: difficultyFor(songRange, userRange) };
    })
    .filter((s) => s.coverage >= threshold)
    .sort((a, b) => b.coverage - a.coverage);
}
