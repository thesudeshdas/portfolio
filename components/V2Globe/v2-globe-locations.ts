export type V2GlobeLocation = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  location: string;
  coordinates: string;
};

export const V2_GLOBE_LOCATIONS: V2GlobeLocation[] = [
  {
    id: 'current-home-bangalore',
    lat: 12.9716,
    lng: 77.5946,
    title: 'Current Home',
    location: 'Bangalore, India',
    coordinates: '12.9716° N, 77.5946° E'
  }
];
