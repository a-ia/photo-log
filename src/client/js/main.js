let currentPage = 1;

async function loadPhotos(page = 1) {
    try {
        const data = await API.getPhotos(page);
        const photoGrid = document.getElementById('photo-grid');
        photoGrid.innerHTML = ''; // clear existing photos

        data.photos.forEach(photo => {
            const photoCard = createPhotoCard(photo);
            photoGrid.appendChild(photoCard);
        });

        // refresh the pagination
        document.getElementById('prev-page').disabled = page === 1;
        document.getElementById('next-page').disabled = page >= data.totalPages;
        document.getElementById('page-info').textContent = `Page ${page}`;
        currentPage = page;
    } catch (error) {
        console.error('Error loading photos:', error);
    }
}

function createPhotoCard(photo) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    
    const tags = photo.tags ? photo.tags.split(',') : [];
    
    card.innerHTML = `
        <img src="${photo.filename}" alt="${photo.title}">
        <div class="photo-info">
            <h2>${photo.title}</h2>
            <p class="description">${photo.description}</p>
            <div class="tags">
                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    return card;
}

// event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadPhotos(1);

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) loadPhotos(currentPage - 1);
    });

    document.getElementById('next-page').addEventListener('click', () => {
        loadPhotos(currentPage + 1);
    });
});


async function uploadPhoto(formData) {
  const response = await fetch('/log/api/upload', {
    method: 'POST',
    body: formData
  });
  return response.json();
}

async function loadPhotosByTag(tag) {
    try {
        const response = await fetch(`/log/api/photos/tag/${tag}`);
        const photos = await response.json();
        const photoGrid = document.getElementById('photo-grid');
        photoGrid.innerHTML = ''; // Clear existing photos

        photos.forEach(photo => {
            const photoCard = createPhotoCard(photo);
            photoGrid.appendChild(photoCard);
        });

        document.getElementById('page-info').textContent = `Tag: ${tag}`;
    } catch (error) {
        console.error('Error loading photos by tag:', error);
    }
}

// createPhotoCard function to make tags clickable
function createPhotoCard(photo) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    
    const tags = photo.tags ? photo.tags.split(',') : [];
    
    card.innerHTML = `
        <img src="${photo.filename}" alt="${photo.title}">
        <div class="photo-info">
            <h2>${photo.title}</h2>
            <p class="description">${photo.description}</p>
            <div class="tags">
                ${tags.map(tag => `<span class="tag" onclick="loadPhotosByTag('${tag}')">${tag}</span>`).join('')}
            </div>
        </div>
    `;
    
    return card;
}

