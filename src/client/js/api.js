const API = {
    async getPhotos(page = 1, limit = 5) {
        const response = await fetch(`/log/api/photos?page=${page}&limit=${limit}`);
        return response.json();
    },

    async addPhoto(photoData) {
        const response = await fetch('/log/api/photos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(photoData)
        });
        return response.json();
    },

    async getPhotosByTag(tag) {
        const response = await fetch(`/log/api/photos/tag/${tag}`);
        return response.json();
    }
};
