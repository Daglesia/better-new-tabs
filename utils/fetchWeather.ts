export interface OpenMeteoCurrent {
  temperature_2m: number;
  time: string;
}

export interface OpenMeteoHourly {
  time: string[];
  precipitation_probability: number[];
  precipitation: number[];
}

export interface OpenMeteoResponse {
  current: OpenMeteoCurrent;
  hourly: OpenMeteoHourly;
  timezone: string;
}

const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchWeather(
  latitude: number,
  longitude: number,
): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m',
    hourly: 'precipitation_probability,precipitation',
    timezone: 'auto',
    forecast_days: '1',
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as OpenMeteoResponse;
}