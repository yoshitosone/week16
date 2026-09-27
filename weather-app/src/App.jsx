import { useState, useEffect } from "react";

function getWeatherLabel(code) {
  if (code >= 71 && code <= 86) return "雪";
  if (code === 0 || code === 1) return "晴れ";
  if (code === 2 || code === 3) return "曇り";
  if (code >= 51 && code <= 67) return "雨";
  if (code >= 95) return "雨";
  return "晴れ";
}

function getWeatherIcon(code) {
  const label = getWeatherLabel(code);
  if (label === "晴れ") return "☀️";
  if (label === "曇り") return "☁️";
  if (label === "雨") return "💧";
  if (label === "雪") return "❄️";
  return "☀️";
}

function getSkyGradient(code) {
  const label = getWeatherLabel(code);
  if (label === "晴れ") return "from-sky-400 to-sky-100";
  if (label === "曇り") return "from-slate-400 to-slate-200";
  if (label === "雨") return "from-slate-600 to-slate-400";
  if (label === "雪") return "from-slate-300 to-slate-100";
  return "from-sky-400 to-sky-100";
}

function App() {
  const [locationName, setLocationName] = useState("");
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;

      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      )
        .then((response) => response.json())
        .then((data) => {
          setWeather(data);
        });

      fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=ja`
      )
        .then((response) => response.json())
        .then((data) => {
          setLocationName(data.city || data.locality);
        });
    });
  }, []);

  return (
    <main
  className={`min-h-screen bg-gradient-to-b ${
    weather ? getSkyGradient(weather.current.weather_code) : "from-sky-400 to-sky-100"
  } text-white`}
>
      {weather && (
        <>
          <header className="text-center pt-12 pb-8">
            <p className="text-lg">{locationName}</p>
            <p className="text-7xl font-bold my-2">
              {Math.round(weather.current.temperature_2m)}°
            </p>
            <p className="text-2xl">
              {getWeatherIcon(weather.current.weather_code)}{" "}
              {getWeatherLabel(weather.current.weather_code)}
            </p>
            <p className="text-sm opacity-80 mt-1">
              最高 {Math.round(weather.daily.temperature_2m_max[0])}° /
              最低 {Math.round(weather.daily.temperature_2m_min[0])}°
            </p>
          </header>

          <section className="bg-white/20 backdrop-blur-sm rounded-t-3xl px-4 py-4 mb-4">
            <div className="flex gap-6 overflow-x-auto pb-2">
              {weather.hourly.time.map((time, index) => (
                <div
                  key={time}
                  className="flex flex-col items-center flex-shrink-0 w-14"
                >
                  <p className="text-sm">{new Date(time).getHours()}時</p>
                  <p className="text-3xl my-1">
                    {getWeatherIcon(weather.hourly.weather_code[index])}
                  </p>
                  <p className="text-sm font-bold">
                    {Math.round(weather.hourly.temperature_2m[index])}°
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white/20 backdrop-blur-sm rounded-3xl mx-4 px-4 py-2 mb-8 max-w-md md:mx-auto">
            {weather.daily.time.map((day, index) => (
              <div
                key={day}
                className="flex items-center justify-between py-3 border-b border-white/20 last:border-0"
              >
                <p className="w-16">
                  {new Date(day).toLocaleDateString("ja-JP", {
                    weekday: "short",
                  })}
                </p>
                <p className="text-2xl">
                  {getWeatherIcon(weather.daily.weather_code[index])}
                </p>
                <div className="flex gap-2 w-24 justify-end">
                  <p className="opacity-70">
                    {Math.round(weather.daily.temperature_2m_min[index])}°
                  </p>
                  <p className="font-bold">
                    {Math.round(weather.daily.temperature_2m_max[index])}°
                  </p>
                </div>
              </div>
            ))}
          </section>
        </>
      )}
    </main>
  );
}

export default App;