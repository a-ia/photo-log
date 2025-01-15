let currentPage = 1;

async function loadPhotos(page = 1) {
    try {
        if (!API.isAuthenticated()) {
            window.location.href = '/log/auth.html';
            return;
        }
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
        if (error.message.includes('401')) {
            window.location.href = '/log/auth.html';
        }
    }
}

async function loadPhotosByTag(tag) {
    try {
        if (!API.isAuthenticated()) {
            window.location.href = '/log/auth.html';
            return;
        }
        const photos = await API.getPhotosByTag(tag);
        const photoGrid = document.getElementById('photo-grid');
        photoGrid.innerHTML = ''; // Clear existing photos
        photos.forEach(photo => {
            const photoCard = createPhotoCard(photo);
            photoGrid.appendChild(photoCard);
        });
        document.getElementById('page-info').textContent = `Tag: ${tag}`;
    } catch (error) {
        console.error('Error loading photos by tag:', error);
        if (error.message.includes('401')) {
            window.location.href = '/log/auth.html';
        }
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
            <p class="description">${photo.description || ''}</p>
            <div class="tags">
                ${tags.map(tag => `<span class="tag" onclick="loadPhotosByTag('${tag.trim()}')">${tag.trim()}</span>`).join('')}
            </div>
            <p class="date">${new Date(photo.date_created).toLocaleDateString()}</p>
        </div>
    `;
    
    return card;
}

function addUploadLink() {
    if (API.isAuthenticated()) {
        const header = document.querySelector('header');
        if (header) {
            const uploadLink = document.createElement('a');
            uploadLink.href = 'upload.html';
            uploadLink.className = 'upload-link';
            uploadLink.textContent = 'Upload New Photo';
            header.appendChild(uploadLink);
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    if (!API.isAuthenticated()) {
        window.location.href = '/log/auth.html';
        return;
    }

    loadPhotos(1);
    addUploadLink();
    
    // Set up pagination event listeners
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) loadPhotos(currentPage - 1);
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        loadPhotos(currentPage + 1);
    });
});
