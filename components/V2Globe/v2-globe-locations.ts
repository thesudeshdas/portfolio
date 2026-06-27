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
  },
  {
    id: 'childhood-kanpur',
    lat: 26.449923,
    lng: 80.331871,
    title: 'Childhood',
    location: 'Kanpur, Uttar Pradesh, India',
    coordinates: '26.449923° N, 80.331871° E',
    calloutSide: 'right',
    showClickHint: false,
    focusView: {
      lat: 26.25,
      lng: 88.47,
      zoom: 200
    }
  },
  {
    id: 'teenage-cuttack',
    lat: 20.462521,
    lng: 85.882988,
    title: 'The OG Home - The Teenage',
    location: 'Cuttack, Odisha, India',
    coordinates: '20.462521° N, 85.882988° E',
    calloutSide: 'left',
    showClickHint: false,
    focusView: {
      lat: 20.26,
      lng: 77.74,
      zoom: 200
    }
  },
  {
    id: 'first-long-ride-munnar',
    lat: 10.089167,
    lng: 77.059723,
    title: 'The First Long Ride',
    location: 'Munnar, Kerala, India',
    coordinates: '10.089167° N, 77.059723° E',
    calloutSide: 'right',
    showClickHint: false,
    focusView: {
      lat: 9.89,
      lng: 85.2,
      zoom: 200
    }
  },
  {
    id: 'first-solo-br-hills',
    lat: 11.99389,
    lng: 77.14056,
    title: 'The First Solo',
    location: 'BR Hills, Karnataka, India',
    coordinates: '11.993890° N, 77.140560° E',
    calloutSide: 'right',
    showClickHint: false,
    focusView: {
      lat: 11.79,
      lng: 85.28,
      zoom: 200
    }
  },
  {
    id: 'brother-resides-pune',
    lat: 18.5204,
    lng: 73.8567,
    title: 'Where a Brother Resides',
    location: 'Pune, India',
    coordinates: '18.5204° N, 73.8567° E',
    calloutSide: 'right',
    showClickHint: false,
    focusView: {
      lat: 18.32,
      lng: 82,
      zoom: 200
    }
  },
  {
    id: 'penukonda-fort',
    lat: 14.079894,
    lng: 77.602197,
    title: 'Penukonda Fort',
    location: 'Penukonda Fort, Andhra Pradesh, India',
    coordinates: '14.079894° N, 77.602197° E',
    calloutSide: 'right',
    showClickHint: false,
    focusView: {
      lat: 13.88,
      lng: 85.74,
      zoom: 200
    }
  },
  {
    id: 'road-trip-udupi',
    lat: 13.340881,
    lng: 74.742142,
    title: 'Road Trip',
    location: 'Udupi, Karnataka, India',
    coordinates: '13.340881° N, 74.742142° E',
    calloutSide: 'right',
    showClickHint: false,
    focusView: {
      lat: 13.14,
      lng: 82.88,
      zoom: 200
    }
  }
];
