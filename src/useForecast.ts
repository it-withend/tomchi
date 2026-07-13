import { useEffect, useState } from 'react';
import { fetchForecast, getCachedForecast, type Forecast } from './engine/weather';

/** Loads a region's forecast (cached 6h) and refetches when the region changes. */
export function useForecast(regionId: string): Forecast | null {
  const [forecast, setForecast] = useState<Forecast | null>(() => getCachedForecast(regionId));

  useEffect(() => {
    let alive = true;
    setForecast(getCachedForecast(regionId));
    fetchForecast(regionId).then((f) => {
      if (alive && f) setForecast(f);
    });
    return () => { alive = false; };
  }, [regionId]);

  return forecast;
}
