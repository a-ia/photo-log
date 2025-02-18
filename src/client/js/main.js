let currentPage = 1;

async function loadPhotos(page = 1) {
    try {
        const data = await API.getPhotos(page);
        const photoGrid = document.getElementById('photo-grid');
        photoGrid.innerHTML = '';
        data.photos.forEach(photo => {
            const photoCard = createPhotoCard(photo);
            photoGrid.appendChild(photoCard);
        });
        document.getElementById('prev-page').disabled = page === 1;
        document.getElementById('next-page').disabled = page >= data.totalPages;
        document.getElementById('page-info').textContent = `Page ${page}`;
        currentPage = page;
    } catch (error) {
        console.error('Error loading photos:', error);
    }
}

async function loadPhotosByTag(tag) {
    try {
        const photos = await API.getPhotosByTag(tag);
        const photoGrid = document.getElementById('photo-grid');
        photoGrid.innerHTML = '';
        photos.forEach(photo => {
            const photoCard = createPhotoCard(photo);
            photoGrid.appendChild(photoCard);
        });
        document.getElementById('page-info').textContent = `Tag: ${tag}`;
    } catch (error) {
        console.error('Error loading photos by tag:', error);
    }
}

function createPhotoCard(photo) {
    const card = document.createElement('div');
    card.className = 'photo-card';
    
    const tags = photo.tags ? photo.tags.split(',') : [];
    
    const deleteButton = API.isAuthenticated() 
        ? `<button class="delete-btn" onclick="deletePhoto(${photo.id})">Delete</button>`
        : '';

    card.innerHTML = `
        <img src="${photo.filename}" alt="${photo.title}">
        <div class="photo-info">
            <h2>${photo.title}</h2>
            <p class="description">${photo.description || ''}</p>
            <p class="date">${new Date(photo.date_created).toLocaleDateString()}</p>         
            <div class="tags">
                ${tags.map(tag => `<span class="tag" onclick="loadPhotosByTag('${tag.trim()}')">${tag.trim()}</span>`).join('')}
            </div>
            ${deleteButton}
        </div>
    `;
  
    return card;
}


async function deletePhoto(id) {
    if (!API.isAuthenticated()) {
        window.location.href = 'auth.html';
        return;
    }
    
    if (!confirm('Are you sure you want to delete this photo?')) {
        return;
    }
    
    try {
        await API.deletePhoto(id);
        loadPhotos(currentPage);
    } catch (error) {
        console.error('Error deleting photo:', error);
        if (error.message.includes('401')) {
            window.location.href = 'auth.html';
        } else {
            alert('Failed to delete photo: ' + error.message);
        }
    }
}

function addUploadLink() {
    const header = document.querySelector('header');
    if (header) {
        const uploadLink = document.createElement('a');
        uploadLink.href = 'upload.html';
        uploadLink.className = 'upload-link';
        uploadLink.textContent = 'Upload New Photo';
        
        // Only show upload link if authenticated
        if (API.isAuthenticated()) {
            header.appendChild(uploadLink);
        } else {
            // Add a login link instead
            uploadLink.href = 'auth.html';
            uploadLink.textContent = 'Login to Upload';
            header.appendChild(uploadLink);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadPhotos(1);
    addUploadLink();
    
    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) loadPhotos(currentPage - 1);
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
        loadPhotos(currentPage + 1);
    });
});


function refreshPath() {
    const currentPath = window.location.pathname;
    const hasIndexHtml = currentPath.endsWith('log/');
    const basePath = currentPath.split('#')[0];
    
    if (hasIndexHtml) {
        window.location.href = basePath;
    } else {
        window.location.href = basePath + 'log/';
    }
}

