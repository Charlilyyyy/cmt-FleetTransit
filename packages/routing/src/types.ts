export interface LatLng {
  lat: number;
  lng: number;
}

export interface OptimizeStop extends LatLng {
  id: string;
  /** Seats consumed at this stop (passengers boarding). Defaults to 1. */
  demand?: number;
  label?: string;
}

export interface OptimizeRequest {
  depot: LatLng;
  stops: OptimizeStop[];
  /** Seat capacity of the assigned vehicle. */
  vehicleCapacity: number;
  direction?: 'pickup' | 'dropoff';
}

export interface OptimizedRoute {
  /** Ordered stop ids from depot outward. */
  order: string[];
  totalDistanceM: number;
  estimatedDurationS: number;
  totalDemand: number;
}

export interface OptimizeResult {
  routes: OptimizedRoute[];
  totalDistanceM: number;
  estimatedDurationS: number;
  computeMs: number;
  /** True when distances came from Google; false when the haversine fallback was used. */
  usedLiveDistances: boolean;
}

/** Symmetric N×N matrices in meters and seconds. Index 0 is always the depot. */
export interface DistanceMatrix {
  distancesM: number[][];
  durationsS: number[][];
  live: boolean;
}
