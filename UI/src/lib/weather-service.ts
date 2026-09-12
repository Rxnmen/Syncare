import { useState, useEffect, useCallback } from "react";

export interface HourlyForecastItem {
  time: string;
  temp: string;
  code: number;
  condition: string;
  heatRisk: "Low" | "Moderate" | "High" | "Extreme";
}

export interface WeatherTelemetry {
  temperature: number;
  feelsLike: number;
  tempMax: number;
  tempMin: number;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
  aqi: number;
  weatherCode: number;
  condition: string;
  conditionSub: string;
  isDay: boolean;
  hourly: HourlyForecastItem[];
  updatedAt: string;
  isLoading: boolean;
  error: string | null;
}

export function mapWmoCode(code: number, isDay = true): { condition: string; sub: string } {
  switch (code) {
    case 0:
      return {
        condition: isDay ? "Clear & Sunny" : "Clear Night",
        sub: isDay ? "Optimal solar clarity" : "Starlit calm",
      };
    case 1:
    case 2:
      return {
        condition: isDay ? "Mostly Sunny" : "Partly Cloudy",
        sub: "Scattered cloud shading",
      };
    case 3:
      return {
        condition: "Overcast",
        sub: "Diffused solar cover",
      };
    case 45:
    case 48:
      return {
        condition: "Campus Mist / Fog",
        sub: "Reduced transit visibility",
      };
    case 51:
    case 53:
    case 55:
      return {
        condition: "Light Drizzle",
        sub: "Humid coastal drizzle",
      };
    case 61:
    case 63:
    case 65:
      return {
        condition: "Rain Showers",
        sub: "Carry umbrella for transitions",
      };
    case 80:
    case 81:
    case 82:
      return {
        condition: "Heavy Showers",
        sub: "Slippery walkway caution",
      };
    case 95:
    case 96:
    case 99:
      return {
        condition: "Thunderstorm Alert",
        sub: "Seek indoor shelter",
      };
    default:
      return {
        condition: "Warm & Temperate",
        sub: "Moderate coastal breeze",
      };
  }
}

export function computeHeatRisk(
  temp: number,
  uv: number
): "Low" | "Moderate" | "High" | "Extreme" {
  if (temp >= 36 || uv >= 9) return "Extreme";
  if (temp >= 33 || uv >= 7) return "High";
  if (temp >= 29 || uv >= 4) return "Moderate";
  return "Low";
}

// Fallback telemetry calibrated for SRM Kattankulathur
export const DEFAULT_WEATHER: WeatherTelemetry = {
  temperature: 33,
  feelsLike: 37,
  tempMax: 35,
  tempMin: 26,
  humidity: 68,
  uvIndex: 8.2,
  windSpeed: 14,
  aqi: 58,
  weatherCode: 1,
  condition: "Mostly Sunny",
  conditionSub: "Coastal Warmth · SRM KTR",
  isDay: true,
  hourly: [
    { time: "Now", temp: "33°", code: 1, condition: "Mostly Sunny", heatRisk: "High" },
    { time: "12 PM", temp: "35°", code: 0, condition: "Peak Heat", heatRisk: "High" },
    { time: "2 PM", temp: "35°", code: 0, condition: "Intense UV", heatRisk: "Extreme" },
    { time: "4 PM", temp: "32°", code: 2, condition: "Easing", heatRisk: "Moderate" },
    { time: "6 PM", temp: "29°", code: 2, condition: "Breeze", heatRisk: "Low" },
    { time: "8 PM", temp: "27°", code: 0, condition: "Pleasant", heatRisk: "Low" },
  ],
  updatedAt: "Live",
  isLoading: false,
  error: null,
};

/**
 * Fetch live weather from Open-Meteo APIs for given coordinates
 */
export async function fetchLiveWeather(
  lat: number,
  lon: number
): Promise<Omit<WeatherTelemetry, "isLoading" | "error">> {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code,uv_index&daily=temperature_2m_max,temperature_2m_min,uv_index_max&timezone=auto`;
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

  const [weatherRes, aqiRes] = await Promise.allSettled([
    fetch(weatherUrl),
    fetch(aqiUrl),
  ]);

  if (weatherRes.status !== "fulfilled" || !weatherRes.value.ok) {
    throw new Error("Could not fetch forecast from Open-Meteo");
  }

  const wData = (await weatherRes.value.json()) as any;
  let aqiVal = 58;

  if (aqiRes.status === "fulfilled" && aqiRes.value.ok) {
    try {
      const aqiData = (await aqiRes.value.json()) as any;
      if (typeof aqiData?.current?.us_aqi === "number") {
        aqiVal = Math.round(aqiData.current.us_aqi);
      }
    } catch {
      // Use fallback AQI
    }
  }

  const current = wData.current || {};
  const daily = wData.daily || {};
  const hourly = wData.hourly || {};

  const temp = Math.round(current.temperature_2m ?? 32);
  const feelsLike = Math.round(current.apparent_temperature ?? temp + 3);
  const humidity = Math.round(current.relative_humidity_2m ?? 65);
  const windSpeed = Math.round(current.wind_speed_10m ?? 12);
  const isDay = current.is_day !== 0;
  const weatherCode = current.weather_code ?? 0;
  const tempMax = Math.round(daily.temperature_2m_max?.[0] ?? temp + 2);
  const tempMin = Math.round(daily.temperature_2m_min?.[0] ?? temp - 6);
  const uvIndex = Number((daily.uv_index_max?.[0] ?? 7.5).toFixed(1));

  const { condition, sub: conditionSub } = mapWmoCode(weatherCode, isDay);

  // Build next 6 hourly items based on current hour
  const currentHour = new Date().getHours();
  const hourlyTimes = (hourly.time as string[]) || [];
  const hourlyTemps = (hourly.temperature_2m as number[]) || [];
  const hourlyCodes = (hourly.weather_code as number[]) || [];
  const hourlyUVs = (hourly.uv_index as number[]) || [];

  const formattedHourly: HourlyForecastItem[] = [];

  for (let i = 0; i < 6; i++) {
    const targetIdx = currentHour + i * 2;
    if (targetIdx < hourlyTimes.length) {
      const hourDate = new Date(hourlyTimes[targetIdx]);
      const hourLabel =
        i === 0
          ? "Now"
          : hourDate.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
      const hTemp = Math.round(hourlyTemps[targetIdx] ?? temp);
      const hCode = hourlyCodes[targetIdx] ?? weatherCode;
      const hUV = hourlyUVs[targetIdx] ?? uvIndex;
      const hCond = mapWmoCode(hCode, hourDate.getHours() >= 6 && hourDate.getHours() < 18).condition;

      formattedHourly.push({
        time: hourLabel,
        temp: `${hTemp}°`,
        code: hCode,
        condition: hCond,
        heatRisk: computeHeatRisk(hTemp, hUV),
      });
    }
  }

  // Fallback if hourly array is sparse
  if (formattedHourly.length === 0) {
    formattedHourly.push(...DEFAULT_WEATHER.hourly);
  }

  return {
    temperature: temp,
    feelsLike,
    tempMax,
    tempMin,
    humidity,
    uvIndex,
    windSpeed,
    aqi: aqiVal,
    weatherCode,
    condition,
    conditionSub,
    isDay,
    hourly: formattedHourly,
    updatedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
  };
}

/**
 * React hook to subscribe to live Open-Meteo telemetry for given coordinates.
 */
export function useWeatherTelemetry(lat: number, lon: number): WeatherTelemetry {
  const [telemetry, setTelemetry] = useState<WeatherTelemetry>({
    ...DEFAULT_WEATHER,
    isLoading: true,
  });

  const loadWeather = useCallback(async () => {
    try {
      const data = await fetchLiveWeather(lat, lon);
      setTelemetry({
        ...data,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      console.warn("Weather fetch error, using resilient fallback:", err);
      setTelemetry((prev) => ({
        ...prev,
        isLoading: false,
        error: err?.message || "Could not fetch latest weather",
      }));
    }
  }, [lat, lon]);

  useEffect(() => {
    loadWeather();
    // Refresh weather telemetry every 15 minutes
    const interval = setInterval(loadWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeather]);

  return telemetry;
}
