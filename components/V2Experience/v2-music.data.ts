export interface V2MusicTrack {
  artist: string;
  artistUrl: string;
  audioSrc: string;
  sourceUrl: string;
  title: string;
}

export const v2MusicTracks: V2MusicTrack[] = [
  {
    artist: 'Cheel',
    artistUrl: 'https://www.youtube.com/channel/UCC9WyMCKVYnc1up0C8ili9A',
    audioSrc: '/audio/lounge/blue-dream.mp3',
    sourceUrl: 'https://www.youtube.com/watch?v=4WVfjizgRcc',
    title: 'Blue Dream'
  },
  {
    artist: 'Dan Henig',
    artistUrl: 'https://www.youtube.com/channel/UCYGkBsrL7uqcqzGz31p_ffQ',
    audioSrc: '/audio/lounge/eternal-garden.mp3',
    sourceUrl: 'https://www.youtube.com/watch?v=T0jrH8NO4Xo',
    title: 'Eternal Garden'
  },
  {
    artist: "E's Jammy Jams",
    artistUrl: 'https://www.youtube.com/channel/UCqB5WMs4Flb6-1Akyuo49vA',
    audioSrc: '/audio/lounge/book-bag.mp3',
    sourceUrl: 'https://www.youtube.com/watch?v=TbeUbgO2AJc',
    title: 'Book Bag'
  },
  {
    artist: 'Joey Pecoraro',
    artistUrl: 'https://www.youtube.com/channel/UCXUbxtXlyp-urIb2hRlXRpQ',
    audioSrc: '/audio/lounge/jazz-mango.mp3',
    sourceUrl: 'https://www.youtube.com/watch?v=g6ipZxMRMhc',
    title: 'Jazz Mango'
  },
  {
    artist: 'Chris Haugen',
    artistUrl: 'https://www.youtube.com/channel/UCutTds62MP2kK8Tb-HUgyIw',
    audioSrc: '/audio/lounge/natural-light.mp3',
    sourceUrl: 'https://www.youtube.com/watch?v=rmEWfFLLUL8',
    title: 'Natural Light'
  }
];
