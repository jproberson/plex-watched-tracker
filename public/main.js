function filterShows() {
    const searchTerm = document.getElementById("search-bar").value.toLowerCase();
    const selectedGenre = document.getElementById("genre-filter").value;
    const selectedCountry = document.getElementById("country-filter").value;
    const shows = document.getElementsByClassName("show");
  
    for (const show of shows) {
      const title = show.getElementsByTagName("h2")[0].innerText.toLowerCase();
      const genres = show.getAttribute("data-genres").split(",");
      const countries = show.getAttribute("data-countries").split(",");
  
      if (
        title.includes(searchTerm) &&
        (selectedGenre === "All" || genres.includes(selectedGenre)) &&
        (selectedCountry === "All" || countries.includes(selectedCountry))
      ) {
        show.style.display = "block";
      } else {
        show.style.display = "none";
      }
    }
  }
  