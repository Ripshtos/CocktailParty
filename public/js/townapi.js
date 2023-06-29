axios
  .get('http://api.geonames.org/searchJSON', {
    params: {
      country: 'IL',
      maxRows: 500,
      username: 'ohad'
    }
  })
  .then(response => {
    const data = response.data;
    const citySelect = document.getElementById('city');

    // Sort the cities alphabetically
    const sortedCities = data.geonames.sort((a, b) => a.name.localeCompare(b.name));

    // Loop through the sorted API results and create option elements
    sortedCities.forEach(city => {
      const option = document.createElement('option');
      option.value = city.name;
      option.textContent = city.name;
      citySelect.appendChild(option);
    });
  })
  .catch(error => {
    console.error('Error fetching cities:', error);
  });
