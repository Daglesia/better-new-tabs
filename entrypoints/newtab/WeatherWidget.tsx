import { useEffect, useState } from 'react';
import { fetchWeather } from '@/utils/fetchWeather';
import { formatWeather } from '@/utils/formatWeather';
import type { FormattedWeather } from '@/utils/formatWeather';

type Status = 'loading' | 'ready' | 'error';

// Fallback if geolocation is denied/unavailable
const DEFAULT_LOCATION = { latitude: 52.4064, longitude: 16.9252 };

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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let { latitude, longitude } = DEFAULT_LOCATION;

      try {
        const position = await getPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch {
        // silently fall back to default location
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

  if (status === 'loading') {
    return <div className="widget weather-widget weather-widget--loading">Loading weather…</div>;
  }

  if (status === 'error') {
    return (
      <div className="widget weather-widget weather-widget--error">
        Couldn't load weather: {error}
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="widget weather-widget">
      <div className="widget__header">
        <span>Weather</span>
      </div>
      <div className="weather-widget__temp">{weather.temperatureC}°C</div>
      <div className="weather-widget__rain">
        {weather.rain.willRain
          ? `🌧️ Rain expected around ${weather.rain.time}`
          : '☀️ No rain expected today'}
      </div>
    </div>
  );
}