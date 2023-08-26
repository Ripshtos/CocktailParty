function applySorting() {
    const sortByPrice = document.getElementById("sortByPrice").value;
    const search = new URLSearchParams(window.location.search);
    
    if (sortByPrice) {
      search.set("sortByPrice", sortByPrice);
    } else {
      search.delete("sortByPrice");
    }

    const currentPath = window.location.pathname;
    const newQueryString = search.toString();
    const newUrl = `${currentPath}?${newQueryString}`;

    window.location.href = newUrl;
  }

   // Get the sorting select element
   const sortByPriceSelect = document.getElementById("sortByPrice");

   // Listen for changes to the sorting option
   sortByPriceSelect.addEventListener("change", function () {
     // Get the form element
     const sortingForm = document.getElementById("sortingForm");
     
     // Submit the form
     sortingForm.submit();
   });