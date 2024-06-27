window.filterShows = function () {
  const searchTerm = document.getElementById('search-bar').value.toLowerCase();
  const selectedGenre = document.getElementById('genre-filter').value;
  const selectedCountry = document.getElementById('country-filter').value;
  const shows = document.getElementsByClassName('show');

  for (const show of shows) {
    const title = show.getElementsByTagName('h2')[0].innerText.toLowerCase();
    const genres = show.getAttribute('data-genres').split(',');
    const countries = show.getAttribute('data-countries').split(',');

    if (
      title.includes(searchTerm) &&
      (selectedGenre === 'All' || genres.includes(selectedGenre)) &&
      (selectedCountry === 'All' || countries.includes(selectedCountry))
    ) {
      show.style.display = 'block';
    } else {
      show.style.display = 'none';
    }
  }
};

function updateRankBadges() {
  const shows = document.querySelectorAll('.show');
  shows.forEach((show, index) => {
    const rankBadge = show.querySelector('.rank-badge');
    rankBadge.textContent = `#${index + 1}`;
  });
}

let sortable;
let adminToken = null;
const toggleDragButton = document.getElementById('toggle-drag');

toggleDragButton.addEventListener('click', () => {
  if (!adminToken) {
    adminToken = prompt('Enter admin token:');
  }

  if (adminToken) {
    if (!sortable) {
      sortable = new Sortable(document.getElementById('show-container'), {
        animation: 150,
        onEnd: function () {
          saveOrder();
          updateRankBadges();
        },
      });
      toggleDragButton.innerText = 'Disable Edit Mode';
    } else {
      sortable.destroy();
      sortable = null;
      toggleDragButton.innerText = 'Enable Edit Mode';
    }
  }
});

async function saveOrder() {
  const order = [];
  document.querySelectorAll('.show').forEach((show, index) => {
    const title = show.getAttribute('data-title');
    order.push({ title, numberOrder: index });
  });
  try {
    const response = await fetch('/save-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ updatedShows: order, token: adminToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to save order');
    }
  } catch (error) {
    console.error('Error saving order:', error.message);
  }
}

document.getElementById('search-bar').addEventListener('keyup', filterShows);
document.getElementById('genre-filter').addEventListener('change', filterShows);
document
  .getElementById('country-filter')
  .addEventListener('change', filterShows);
