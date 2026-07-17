export interface V2MusicTrack {
  artist: string;
  artistUrl: string;
  audioSrc: string;
  sourceUrl: string;
  title: string;
}

const JOHN_BARTMANN_URL = 'https://freemusicarchive.org/music/John_Bartmann/';
const COLLECTION_URL =
  'https://freemusicarchive.org/music/John_Bartmann/100-ambient-atmospheric-soundtracks-straylight-drones-collection';

export const v2MusicTracks: V2MusicTrack[] = [
  {
    artist: 'John Bartmann',
    artistUrl: JOHN_BARTMANN_URL,
    audioSrc: '/audio/lounge/nightshift.mp3',
    sourceUrl: `${COLLECTION_URL}/nightshift-master/`,
    title: 'Nightshift'
  },
  {
    artist: 'John Bartmann',
    artistUrl: JOHN_BARTMANN_URL,
    audioSrc: '/audio/lounge/memory-shores.mp3',
    sourceUrl: `${COLLECTION_URL}/memory-shores-master/`,
    title: 'Memory Shores'
  },
  {
    artist: 'John Bartmann',
    artistUrl: JOHN_BARTMANN_URL,
    audioSrc: '/audio/lounge/mirrors-of-faolan.mp3',
    sourceUrl: `${COLLECTION_URL}/mirrors-of-faolan-master/`,
    title: 'Mirrors of Faolan'
  },
  {
    artist: 'John Bartmann',
    artistUrl: JOHN_BARTMANN_URL,
    audioSrc: '/audio/lounge/purple-ice-crystals.mp3',
    sourceUrl: `${COLLECTION_URL}/purple-ice-crystals-master/`,
    title: 'Purple Ice Crystals'
  },
  {
    artist: 'John Bartmann',
    artistUrl: JOHN_BARTMANN_URL,
    audioSrc: '/audio/lounge/aetherbells.mp3',
    sourceUrl: `${COLLECTION_URL}/aetherbells-master/`,
    title: 'Aetherbells'
  }
];
