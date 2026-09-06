import type { OpenMeteoResponse } from './fetchWeather';

export interface RainForecast {
  willRain: boolean;
  time: string | null;
}

export interface FormattedWeather {
  temperatureC: number;
  rain: RainForecast;
}

// Minimum probability (%) before we call it "rain expected"
const RAIN_PROBABILITY_THRESHOLD = 40;

export function formatWeather(data: OpenMeteoResponse): FormattedWeather {
  const temperatureC = Math.round(data.current.temperature_2m);
  const currentTime = new Date(data.current.time);

  let rain: RainForecast = { willRain: false, time: null };

  const { time, precipitation_probability, precipitation } = data.hourly;

  for (let i = 0; i < time.length; i++) {
    const timeStr = time[i];
    if (!timeStr) continue; // narrows away the `undefined` from noUncheckedIndexedAccess

    const hourTime = new Date(timeStr);
    if (hourTime < currentTime) continue; // only look at the rest of today

    const probability = precipitation_probability?.[i] ?? 0;
    const amount = precipitation?.[i] ?? 0;

    if (probability >= RAIN_PROBABILITY_THRESHOLD || amount > 0) {
      rain = {
        willRain: true,
        time: hourTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      break;
    }
  }

  return { temperatureC, rain };
}