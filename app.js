// Configure endpoint based on environment
// When using wrangler dev --remote, the worker is deployed to a temporary subdomain
const endpoint = 'http://127.0.0.1:8787';

const form = document.getElementById('form');
const zipInp = document.getElementById('zip');
const out = document.getElementById('output');

// Map of weather conditions to emojis
const weatherEmojis = {
  // Clear
  'Clear': '☀️',
  // Clouds
  'Clouds': '☁️',
  'Few Clouds': '🌤️',
  'Scattered Clouds': '⛅',
  'Broken Clouds': '🌥️',
  'Overcast Clouds': '☁️',
  // Rain
  'Rain': '🌧️',
  'Light Rain': '🌦️',
  'Moderate Rain': '🌧️',
  'Heavy Rain': '⛈️',
  'Drizzle': '🌦️',
  'Shower Rain': '🌧️',
  // Thunderstorm
  'Thunderstorm': '⛈️',
  // Snow
  'Snow': '❄️',
  'Light Snow': '🌨️',
  'Heavy Snow': '❄️',
  'Sleet': '🌨️',
  // Special
  'Mist': '🌫️',
  'Fog': '🌫️',
  'Haze': '🌫️',
  'Smoke': '🌫️',
  'Dust': '🌫️',
  'Sand': '🌫️',
  'Ash': '🌫️',
  'Squall': '💨',
  'Tornado': '🌪️'
};

// Get emoji for weather condition
function getWeatherEmoji(weatherCondition) {
  return weatherEmojis[weatherCondition] || '🌡️'; // Default thermometer emoji if condition not found
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  const zip = zipInp.value.trim();
  if (!zip) return;

  out.classList.add('hidden');  // reset view
  
  try {
    // Always use US as the country code
    const r = await fetch(`${endpoint}?zip=${encodeURIComponent(zip)}&country=us`);
    
    if (!r.ok) {
      const errorData = await r.json().catch(() => ({ error: 'Failed to parse error response' }));
      throw new Error(errorData.error || `Error: ${r.status} ${r.statusText}`);
    }

    const weatherData = await r.json();
    
    // Use feels_like temperature 
    const realFeel = weatherData.main.feels_like;
    const locationName = weatherData.name;
    const round5 = Math.round(realFeel / 5) * 5;

    // Get weather condition and emoji
    const weatherCondition = weatherData.weather[0].main;
    const weatherEmoji = getWeatherEmoji(weatherCondition);

    // Determine temperature class based on relationship between real feel and rounded
    let tempClass = 'temp-equal';
    if (realFeel > round5) {
      tempClass = 'temp-higher'; // Real feel is higher than rounded
    } else if (realFeel < round5) {
      tempClass = 'temp-lower';  // Real feel is lower than rounded
    }

    // Create a simplified output with the location, weather emoji, and rounded temp
    out.innerHTML = `
      <h2 id="location"><span class="weather-emoji">${weatherEmoji}</span> <span class="location-name">${locationName}</span></h2>
      <div class="temp-container">
        <div class="temp-value ${tempClass}">${round5}°</div>
      </div>
    `;
    out.classList.remove('hidden');
  } catch (err) {
    console.error('Error fetching weather:', err);
    out.innerHTML = `<p class="error">${err.message || 'Failed to fetch weather data'}</p>`;
    out.classList.remove('hidden');
  }
});
