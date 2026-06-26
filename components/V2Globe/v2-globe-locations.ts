export type V2GlobeLocation = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  location: string;
  coordinates: string;
  date?: string;
  calloutSide?: 'left' | 'right';
  showClickHint?: boolean;
  focusView: {
    lat: number;
    lng: number;
    zoom: number;
  };
};

export const V2_GLOBE_LOCATIONS: V2GlobeLocation[] = [
  {
    id: 'current-home-bangalore',
    lat: 12.9716,
    lng: 77.5946,
    title: 'Current Home',
    location: 'Bangalore, India',
    coordinates: '12.9716° N, 77.5946° E',
    calloutSide: 'right',
    showClickHint: false,
    focusView: {
      lat: 12.8234,
      lng: 85.7327,
      zoom: 200
    }
  },
  {
    id: 'birth-jorhat',
    lat: 26.757874,
    lng: 94.209824,
    title: 'Birth',
    location: 'Jorhat, Assam, India',
    coordinates: '26.757874° N, 94.209824° E',
    date: '3rd August, 2001',
    calloutSide: 'left',
    showClickHint: false,
    focusView: {
      lat: 26.52,
      lng: 86.07,
      zoom: 200
    }
  }
];
