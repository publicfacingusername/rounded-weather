// Configure endpoint based on environment
// When using wrangler dev --remote, the worker is deployed to a temporary subdomain
const endpoint = 'https://api.roundedweather.com';

// Wait for DOM to fully load before running any code
document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const form = document.getElementById('form');
  const zipInp = document.getElementById('zip');
  const out = document.getElementById('output');
  const zipEntry = document.getElementById('zip-entry');
  const tempDisplay = document.getElementById('temp-display');
  const locationEl = document.getElementById('location');

  // State variables
  let currentWeatherData = null;
  let showingRealFeel = false;
  let currentZip = '10001'; // Track the current zip code

  // Map of weather conditions to emojis
  const weatherEmojis = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️',
    'Dust': '🌫️',
    'Smoke': '🌫️',
    'Tornado': '🌪️',
    'Squall': '💨'
  };

  // Get emoji for weather condition
  function getWeatherEmoji(weatherCondition) {
    return weatherEmojis[weatherCondition] || '🌡️';
  }

  // Function to show zip entry
  function showZipEntry() {
    zipInp.value = currentZip;
    zipEntry.classList.remove('hidden');
    locationEl.classList.add('hidden');
    setTimeout(() => zipInp.focus(), 50);
  }

  // Function to hide zip entry
  function hideZipEntry() {
    zipEntry.classList.add('hidden');
    locationEl.classList.remove('hidden');
  }

  // Toggle zip code entry when location is clicked
  locationEl.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent document click from immediately closing
    showZipEntry();
  });

  // Toggle between rounded and real feel temperature
  tempDisplay.addEventListener('click', () => {
    if (!currentWeatherData) return;
    showingRealFeel = !showingRealFeel;
    updateTemperatureDisplay();
  });

  // Click outside to cancel zip entry
  document.addEventListener('click', (e) => {
    if (!zipEntry.classList.contains('hidden') &&
        !zipEntry.contains(e.target) && 
        !locationEl.contains(e.target)) {
      hideZipEntry();
    }
  });

  // Close the zip entry on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !zipEntry.classList.contains('hidden')) {
      hideZipEntry();
    }
  });

  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const zip = zipInp.value.trim();
    if (!zip) return;
    
    fetchWeather(zip);
    hideZipEntry();
  });

  // Update the temperature display based on current state
  function updateTemperatureDisplay() {
    if (!currentWeatherData) return;

    const realFeel = currentWeatherData.main.feels_like;
    const round5 = Math.round(realFeel / 5) * 5;
    const weatherDescription = currentWeatherData.weather[0].description;

    // Capitalize first letter of each word in description
    const formattedDescription = weatherDescription
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    let tempNumberContent;
    let conditionTextContent = ''; // Default to empty

    if (showingRealFeel) {
      tempNumberContent = realFeel.toFixed(1);
      conditionTextContent = formattedDescription;
      tempDisplay.classList.add('showing-real-feel');
      // Ensure other color classes are removed if any were present
      tempDisplay.classList.remove('temp-neutral', 'temp-higher', 'temp-higher-strong', 'temp-lower', 'temp-lower-strong');
    } else {
      tempNumberContent = round5;
      // conditionTextContent remains empty

      tempDisplay.classList.remove('showing-real-feel');
      // Reset specific color classes before applying the correct one
      tempDisplay.classList.remove('temp-neutral', 'temp-higher', 'temp-higher-strong', 'temp-lower', 'temp-lower-strong');
      
      const diff = Math.abs(realFeel - round5);
      if (diff < 1) {
        tempDisplay.classList.add('temp-neutral');
      } else if (realFeel > round5) {
        if (diff >= 2.5) {
          tempDisplay.classList.add('temp-higher-strong');
        } else {
          tempDisplay.classList.add('temp-higher');
        }
      } else {
        if (diff >= 2.5) {
          tempDisplay.classList.add('temp-lower-strong');
        } else {
          tempDisplay.classList.add('temp-lower');
        }
      }
    }

    // Consistent inner HTML structure
    tempDisplay.innerHTML = `
      <div class="temp-primary">
        <span class="temp-number">${tempNumberContent}°</span>
      </div>
      <div class="temp-secondary">
        <span class="condition-text">${conditionTextContent}</span>
      </div>
    `;
  }

  // Fetch weather data for a zip code
  async function fetchWeather(zip) {
    // Make sure output is visible
    out.classList.remove('hidden');
    
    // Show loading state
    tempDisplay.innerHTML = `...`;
    tempDisplay.className = 'temp-value loading';
    locationEl.textContent = 'Loading...';
    
    try {
      // Store current zip code
      currentZip = zip;
      
      // Always use US as the country code
      const r = await fetch(`${endpoint}?zip=${encodeURIComponent(zip)}&country=us`);
      
      if (!r.ok) {
        const errorData = await r.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `Error: ${r.status} ${r.statusText}`);
      }

      const weatherData = await r.json();
      currentWeatherData = weatherData;
      
      // Get weather condition and emoji
      const weatherCondition = weatherData.weather[0].main;
      const weatherEmoji = getWeatherEmoji(weatherCondition);
      const locationName = weatherData.name;

      // Update location display
      locationEl.innerHTML = 
        `<span class="weather-emoji">${weatherEmoji}</span> <span class="location-name">${locationName}</span>`;
      
      // Update temperature display
      showingRealFeel = false;
      updateTemperatureDisplay();
      
      // Ensure proper visibility
      hideZipEntry();
    } catch (err) {
      console.error('Error fetching weather:', err);
      locationEl.textContent = 'Error';
      tempDisplay.innerHTML = `<div class="error">${err.message || 'Failed to fetch weather'}</div>`;
      tempDisplay.className = 'temp-value';
      
      hideZipEntry();
    }
  }

  // Load default weather on page load
  fetchWeather('10001');
});
