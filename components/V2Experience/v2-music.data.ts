export interface V2MusicTrack {
  albumArtSrc: string;
  artist: string;
  audioSrc: string;
  title: string;
}

export const v2MusicTracks: V2MusicTrack[] = [
  {
    albumArtSrc: '/images/music/blue-dream.jpg',
    artist: 'Cheel',
    audioSrc: '/audio/lounge/blue-dream.mp3',
    title: 'Blue Dream'
  },
  {
    albumArtSrc: '/images/music/eternal-garden.jpg',
    artist: 'Dan Henig',
    audioSrc: '/audio/lounge/eternal-garden.mp3',
    title: 'Eternal Garden'
  },
  {
    albumArtSrc: '/images/music/book-bag.jpg',
    artist: "E's Jammy Jams",
    audioSrc: '/audio/lounge/book-bag.mp3',
    title: 'Book Bag'
  },
  {
    albumArtSrc: '/images/music/jazz-mango.jpg',
    artist: 'Joey Pecoraro',
    audioSrc: '/audio/lounge/jazz-mango.mp3',
    title: 'Jazz Mango'
  },
  {
    albumArtSrc: '/images/music/natural-light.jpg',
    artist: 'Chris Haugen',
    audioSrc: '/audio/lounge/natural-light.mp3',
    title: 'Natural Light'
  }
];
