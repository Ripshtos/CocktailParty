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

  // Get the products
  const products = document.querySelectorAll(".product");

  // Sort the products
  if (sortByPrice === "name_asc") {
    products.sort((a, b) => a.textContent.localeCompare(b.textContent));
  } else if (sortByPrice === "name_desc") {
    products.sort((a, b) => b.textContent.localeCompare(a.textContent));
  }

  // Update the DOM
  products.forEach((product) => product.classList.remove("sort-asc", "sort-desc"));
  if (sortByPrice === "name_asc") {
    products[0].classList.add("sort-asc");
  } else if (sortByPrice === "name_desc") {
    products[products.length - 1].classList.add("sort-desc");
  }
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