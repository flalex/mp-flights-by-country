const VALID_AIRPORT_CODE_LENGTH = 3;
const API_KEY = '67486213c3046da4eda9c23a';
const NETWORK_TIMEOUT = 30000;

// UI related scripts.
function startLoading() {
    document.getElementById('loading-spinner').style.display = 'block';
    showError(null);
};
  
function stopLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
};

document
  .getElementById('airportForm')
  .addEventListener('submit', async function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const payload = Object.fromEntries(formData.entries());
    const airportCode = payload.airportCode;

    if (airportCode.length !== VALID_AIRPORT_CODE_LENGTH) {
      alert('Please enter a valid 3-character airport code.');
      return;
    }

    startLoading();

    const flightsResponse = await fetchFlightsSchedule(airportCode);
    console.log(flightsResponse);

    const flightsCountByCountry = getFlightsCountByCountry(flightsResponse.data);
    console.log(flightsCountByCountry);

    displayResults(flightsCountByCountry);

    stopLoading();

    showError(flightsResponse.error);
  });

function displayResults(data) {
    const tableBody = document.querySelector('#resultsTable tbody');
    tableBody.innerHTML = '';

    if (!data || Object.keys(data).length === 0) {
        document.getElementById('resultsTable').classList.add('hidden');
        return;
    }

    Object.entries(data).forEach(([country, numFlights]) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${country}</td><td>${numFlights}</td>`;
        tableBody.appendChild(row);
    });

    document.getElementById('resultsTable').classList.remove('hidden');
}

function showError(errorMessage) {
    const errorElement = document.getElementById('errorMessage');
    if (!errorMessage) {
        errorElement.classList.add('hidden');
        errorElement.textContent = '';
    } else {
        errorElement.classList.remove('hidden');
        errorElement.textContent = errorMessage;
    }
}

// API related scripts.
async function fetchFlightsSchedule(airportCode) {
    const apiKey = sessionStorage.getItem('apiKey') || localStorage.getItem('apiKey') || API_KEY;
    const url = `https://api.flightapi.io/compschedule/${apiKey}?mode=arrivals&iata=${airportCode}&day=1`;
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchTimeout = setTimeout(() => {
        controller.abort();
    }, NETWORK_TIMEOUT);

    try {
        const response = await fetch(url, { signal });
        clearTimeout(fetchTimeout);

        const data = await response.json();
        if (!response.ok || (!data.success && data.message)) {
            return { status: 'error', error: data.message || response.statusText };
        }

        return { status: 'success', data };
    } catch (error) {
      console.log(error);
      return { status: 'error', error: error.name === 'AbortError' ? 'Request timed out' : error.message };
    }
}

// Function to extract arrivals and timezone offset
function extractArrivals(dataRecord) {
  try {
    const pluginData = dataRecord.airport.pluginData;
    const schedule = pluginData.schedule;
    const timezoneOffsetHrs = pluginData.details.timezone.offset / 3600;

    return [schedule.arrivals.data, timezoneOffsetHrs];
  } catch (error) {
    console.error('Error extracting arrivals:', error);
    return [[], 0]; // Return empty array and zero offset in case of error
  }
}

// Function to extract flight ID based on arrival data and timezone offset
function extractFlightId(arrival, timezoneOffsetHrs) {
  const identification = arrival.flight.identification;
  const flightNumber = identification.number.default;
  const countryName = arrival.flight.airport.origin.position.country.name;

  const timeRealArrival = arrival.flight.time.real.arrival;
  const timeScheduledArrival = arrival.flight.time.scheduled.arrival;
  let timeArrival = timeRealArrival || timeScheduledArrival;

  // Convert the timestamp to Date
  timeArrival = new Date(timeArrival * 1000); // Assuming timestamp is in seconds

  const currentUtcDate = new Date(
    new Date().getTime() + timezoneOffsetHrs * 3600 * 1000
  )
    .toISOString()
    .split('T')[0]; // Get UTC date based on timezone

  const arrivalDate = timeArrival.toISOString().split('T')[0]; // Extract the date part of the arrival time

  // If the arrival date doesn't match the current UTC date with timezone offset, return null
  if (arrivalDate !== currentUtcDate) {
    return null;
  }

  return [timeArrival, flightNumber, countryName];
}

// Function to transform data into unique flight information (country flight count)
function getFlightsCountByCountry(data) {
  const countryFlightCount = {};
  if (!data || !Array.isArray(data)) {
    return countryFlightCount;
  }
  
  const result = new Set(); // Using a Set to ensure uniqueness

  data.forEach((dataRecord) => {
    const [arrivals, timezoneOffsetHrs] = extractArrivals(dataRecord);

    arrivals.forEach((arrival) => {
      const flightId = extractFlightId(arrival, timezoneOffsetHrs);
      if (flightId) {
        result.add(JSON.stringify(flightId));
      }
    });
  });


  result.forEach((flightId) => {
    const [, , country] = JSON.parse(flightId);
    countryFlightCount[country] = (countryFlightCount[country] || 0) + 1;
  });

  return countryFlightCount;
}
