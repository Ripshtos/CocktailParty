const axios = require('axios');

// Fetch cities from API and populate dropdown options
fetch('http://api.geonames.org/searchJSON?country=IL&maxRows=500&username=ohad')
.then(response => response.json())
.then(data => {
  const citySelect = document.getElementById('city');

  // Loop through the API results and create option elements
  data.geonames.forEach(city => {
    const option = document.createElement('option');
    option.value = city.name;
    option.textContent = city.name;
    citySelect.appendChild(option);
  });
})
.catch(error => {
  console.error('Error fetching cities:', error);
});