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

let sortable;
let adminToken = null;
const toggleDragButton = document.getElementById("toggle-drag");

toggleDragButton.addEventListener("click", () => {
  if (!adminToken) {
    adminToken = prompt("Enter admin token:");
  }

  if (adminToken) {
    if (!sortable) {
      sortable = new Sortable(document.getElementById("show-container"), {
        animation: 150,
        onEnd: function () {
          saveOrder();
        },
      });
      toggleDragButton.innerText = "Disable Edit Mode";
    } else {
      sortable.destroy();
      sortable = null;
      toggleDragButton.innerText = "Enable Edit Mode";
    }
  }
});

async function saveOrder() {
  const order = [];
  document.querySelectorAll(".show").forEach((show) => {
    order.push(show.getAttribute("data-title")); // Use data-title attribute to get the show title
  });

  try {
    const response = await fetch("/save-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order, token: adminToken }),
    });

    if (!response.ok) {
      throw new Error("Failed to save order");
    }

    console.log("Order saved successfully");
  } catch (error) {
    console.error("Error saving order:", error.message);
  }
}

document.getElementById("search-bar").addEventListener("keyup", filterShows);
document.getElementById("genre-filter").addEventListener("change", filterShows);
document
  .getElementById("country-filter")
  .addEventListener("change", filterShows);
