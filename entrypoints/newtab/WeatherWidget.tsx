import { useEffect, useState } from 'react';
import { fetchWeather } from '@/utils/fetchWeather';
import { formatWeather } from '@/utils/formatWeather';
import type { FormattedWeather } from '@/utils/formatWeather';
import { withDataCollection } from '@/utils/permissions';

type Status = 'loading' | 'ready' | 'error';

// Fallback if geolocation is denied/unavailable
const DEFAULT_LOCATION = { latitude: 52.4064, longitude: 16.9252 };

// Firefox-only optional permission (Chromium ignores/doesn't support it)
const LOCATION_PERM = withDataCollection({}, 'locationInfo');

async function hasLocationPermission(): Promise<boolean> {
  try {
    return await browser.permissions.contains(LOCATION_PERM);
  } catch {
    return false;
  }
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
  });
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<FormattedWeather | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [usingDefault, setUsingDefault] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let { latitude, longitude } = DEFAULT_LOCATION;

      const granted = await hasLocationPermission();
      if (cancelled) return;
      setUsingDefault(!granted);

      // Only touch geolocation once the data permission has been granted
      if (granted) {
        try {
          const position = await getPosition();
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch {
          // silently fall back to default location
        }
      }

      try {
        const data = await fetchWeather(latitude, longitude);
        if (cancelled) return;
        setWeather(formatWeather(data));
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load weather');
        setStatus('error');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Must request directly in the click handler to keep the user gesture
  const enableLocation = async () => {
    if (await browser.permissions.request(LOCATION_PERM)) window.location.reload();
  };

  if (status === 'loading') {
    return <div className="widget">Loading weather…</div>;
  }

  if (status === 'error') {
    return (
      <div className="widget">
        Couldn't load weather: {error}
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="widget">
      <div className="widget__header">
        <span>Weather</span>
      </div>
      <div>{weather.temperatureC}°C</div>
      <div>
        {weather.rain.willRain
          ? `🌧️ Rain expected around ${weather.rain.time}`
          : '☀️ No rain expected today'}
      </div>
      {usingDefault && (
        <button type="button" onClick={enableLocation}>
          Use my location
        </button>
      )}
    </div>
  );
}
