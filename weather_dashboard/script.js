const { useState, useEffect } = React;
const { createRoot } = ReactDOM;

function WeatherDashboard() {
    const [location, setLocation] = useState("New York");
    const [weatherData, setWeatherData] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const weatherIcons = {
        0: "☀️",
        1: "🌤️",
        2: "⛅",
        3: "☁️",
        45: "🌫️",
        51: "🌧️",
        61: "🌧️",
        63: "🌧️",
        71: "❄️",
        80: "🌦️",
        95: "⛈️",
    };

    async function fetchCoordinates() {
        if (!location) return;
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                const { latitude, longitude, name } = data.results[0];
                setLocation(name);
                setCoordinates({ latitude, longitude });
            } else {
                setError("Location not found");
                setWeatherData(null);
            }
        } catch (err) {
            setError("Error finding location");
            setWeatherData(null);
        } finally {
            setLoading(false);
        }
    }

    async function fetchWeather() {
        if (!coordinates) return;
        setLoading(true);

        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${coordinates.latitude}&longitude=${coordinates.longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
            );
            const data = await response.json();
            setWeatherData(data);
            setError(null);
        } catch (err) {
            setError("Error fetching weather data");
            setWeatherData(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCoordinates();
    }, []);

    useEffect(() => {
        if (coordinates) {
            fetchWeather();
        }
    }, [coordinates]);

    return (
        <div className="container">
            <h1>Weather Dashboard</h1>

            <div className="search-container">
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter City"
                    onKeyPress={(e) => e.key === "Enter" && fetchCoordinates()}
                />
                <button onClick={fetchCoordinates} disabled={loading}>
                    {loading ? "🔄" : "🔍"}
                </button>
            </div>

            {error && <p style={{ color: "#ff6b6b" }}>{error}</p>}

            {weatherData && !loading && (
                <div className="weather-card">
                    <h2>{location}</h2>
                    <p>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>

                    <div className="weather-icon">
                        {weatherIcons[weatherData.current_weather.weathercode] || "❓"}
                    </div>

                    <h3>{Math.round(weatherData.current_weather.temperature)}°C</h3>

                    <div className="weather-details">
                        <div>
                            <span>🌡️ High</span>
                            <strong>{Math.round(weatherData.daily.temperature_2m_max[0])}°C</strong>
                        </div>
                        <div>
                            <span>🌡️ Low</span>
                            <strong>{Math.round(weatherData.daily.temperature_2m_min[0])}°C</strong>
                        </div>
                        <div>
                            <span>💨 Wind</span>
                            <strong>{weatherData.current_weather.windspeed} km/h</strong>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const root = createRoot(document.getElementById("root"));
root.render(<WeatherDashboard />);

