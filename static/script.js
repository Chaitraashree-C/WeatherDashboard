const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityInput = document.getElementById('city-input');
const temperature = document.getElementById('temperature');
const condition = document.getElementById('condition');
const locationName = document.getElementById('location-name');
const currentDay = document.getElementById('current-day');
const currentDate = document.getElementById('current-date');
const conditionIcon = document.getElementById('condition-icon');
const weatherOutput = document.getElementById('weather-output');
const forecastOutput = document.getElementById('forecast-output');
const forecastContainer = document.getElementById('forecast-container');
const errorMessageDiv = document.getElementById('error-message');
const errorText = document.getElementById('error-text');

// Get the current date and day
function displayDateAndDay() {
    const today = new Date();
    const optionsDay = { weekday: 'long' };
    const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };

    const day = today.toLocaleDateString('en-US', optionsDay);
    const date = today.toLocaleDateString('en-US', optionsDate);

    currentDay.textContent = day;
    currentDate.textContent = date;
}

displayDateAndDay();

// Fetch weather by city name
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        weatherOutput.style.display = 'none'; // Hide weather output initially
        forecastOutput.style.display = 'none'; // Hide forecast output initially
        errorMessageDiv.style.display = 'none'; // Hide error message initially
        fetchWeather(`/weather?city=${city}`);
        fetchForecast(`/forecast?city=${city}`);
    } else {
        errorText.textContent = 'Please enter a city name!';
        errorMessageDiv.style.display = 'block';
    }
});

// Fetch weather by current location
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            weatherOutput.style.display = 'none'; // Hide weather output initially
            forecastOutput.style.display = 'none'; // Hide forecast output initially
            errorMessageDiv.style.display = 'none'; // Hide error message initially
            fetchWeather(`/weather?lat=${latitude}&lon=${longitude}`);
            fetchForecast(`/forecast?lat=${latitude}&lon=${longitude}`);
        }, error => {
            alert('Error retrieving location. Please try again.');
        });
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

// Function to fetch weather data
function fetchWeather(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => displayWeather(data))
        .catch(err => {
            console.error('Fetch error:', err);
            errorText.textContent = 'Failed to fetch weather data! Please try again later.';
            errorMessageDiv.style.display = 'block'; // Show the error message
            weatherOutput.style.display = 'none'; // Hide weather output
            forecastOutput.style.display = 'none'; // Hide forecast output
        });
}

// Function to display current weather data
function displayWeather(data) {
    if (data.cod && data.cod === '404') {
        // City not found
        errorText.textContent = 'City not found. Please check the name and try again.';
        errorMessageDiv.style.display = 'block'; // Show the error message
        weatherOutput.style.display = 'none'; // Hide weather output
        forecastOutput.style.display = 'none'; // Hide forecast output
        return;
    }

    if (data.main) {
        weatherOutput.style.display = 'block'; // Show weather output

        locationName.textContent = data.name || "Current Location";
        temperature.textContent = `${data.main.temp} °C`;
        condition.textContent = data.weather[0].description;

        const iconCode = data.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;
        conditionIcon.src = iconUrl;

        const precipitation = data.rain ? data.rain['1h'] : 0;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;

        const weatherMetrics = `
            <div class="weather-metric">
                <img src="https://img.icons8.com/ios/50/000000/rain.png" alt="Precipitation" class="metric-icon">
                <span>${precipitation ? precipitation + ' mm' : 'No rain'}</span>
            </div>
            <div class="weather-metric">
                <img src="https://img.icons8.com/ios/50/000000/humidity.png" alt="Humidity" class="metric-icon">
                <span>${humidity} %</span>
            </div>
            <div class="weather-metric">
                <img src="https://img.icons8.com/ios/50/000000/wind.png" alt="Wind Speed" class="metric-icon">
                <span>${windSpeed} m/s</span>
            </div>
        `;

        document.querySelector('.weather-metrics').innerHTML = weatherMetrics;
    } else {
        errorText.textContent = 'Failed to fetch weather data!';
        errorMessageDiv.style.display = 'block'; // Show the error message
        weatherOutput.style.display = 'none'; // Hide weather output
        forecastOutput.style.display = 'none'; // Hide forecast output
    }
}

// Function to fetch 5-day forecast data
function fetchForecast(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => displayForecast(data))
        .catch(err => {
            console.error('Fetch error:', err);
            errorText.textContent = 'Failed to fetch forecast data! Please try again later.';
            errorMessageDiv.style.display = 'block'; // Show the error message
            weatherOutput.style.display = 'none'; // Hide weather output
            forecastOutput.style.display = 'none'; // Hide forecast output
        });
}

// Function to display 5-day forecast
function displayForecast(data) {
    if (data.cod && data.cod === '404') {
        // City not found
        errorText.textContent = 'City not found. Please check the name and try again.';
        errorMessageDiv.style.display = 'block'; // Show the error message
        weatherOutput.style.display = 'none'; // Hide weather output
        forecastOutput.style.display = 'none'; // Hide forecast output
        return;
    }

    if (data.list) {
        forecastOutput.style.display = 'block'; // Show forecast output
        forecastContainer.innerHTML = ''; // Clear previous forecast

        // Get today's date and day
        const today = new Date();
        const todayDate = today.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        // Initialize an array to store unique days for the forecast
        let forecastDays = [];

        data.list.forEach((dayData) => {
            const forecastDay = new Date(dayData.dt * 1000);
            const dayOfWeek = forecastDay.toLocaleDateString('en-US', { weekday: 'long' });
            const dayOfMonth = forecastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const formattedDate = `${dayOfWeek} (${dayOfMonth})`;

            // Skip the current forecast day (today)
            if (forecastDay.toDateString() !== today.toDateString()) {
                // Ensure unique days are added
                if (!forecastDays.some(d => d.formattedDate === formattedDate)) {
                    forecastDays.push({
                        date: forecastDay,
                        formattedDate: formattedDate,
                        temp: dayData.main.temp,
                        description: dayData.weather[0].description,
                        iconCode: dayData.weather[0].icon,
                        dayOfWeek, // Store separate day
                        dayOfMonth // Store separate date
                    });
                }
            }
        });

        // Limit the forecast to only 5 days, starting from tomorrow
        forecastDays = forecastDays.slice(0, 5);

        forecastDays.forEach(day => {
            const forecastIconUrl = `https://openweathermap.org/img/wn/${day.iconCode}.png`;

            const forecastElement = `
                <div class="forecast-day">
                    <p class="forecast-day-name">${day.dayOfWeek}</p>
                    <p class="forecast-day-date">${day.dayOfMonth}</p>
                    <p class="forecast-day-temp">${day.temp} °C</p>
                    <img src="${forecastIconUrl}" alt="Forecast Icon">
                    <p class="forecast-day-condition">${day.description}</p>
                </div>
            `;
            forecastContainer.innerHTML += forecastElement;
        });
    } else {
        errorText.textContent = 'Failed to fetch forecast data! Please try again later.';
        errorMessageDiv.style.display = 'block'; // Show the error message
        weatherOutput.style.display = 'none'; // Hide weather output
        forecastOutput.style.display = 'none'; // Hide forecast output
    }
}
