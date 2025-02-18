const API = {
    // Authentication methods
    async login(password) {
        console.log('API login called with password:', password);
        try {
            const response = await fetch('/log/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });
            console.log('Raw response:', response);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Parsed response data:', data);
            
            if (data.token) {
                localStorage.setItem('token', data.token);
                console.log('Token stored in localStorage');
            }
            return data;
        } catch (error) {
            console.error('API login error:', error);
            throw error;
        }
    },

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    },

    // Public methods (still require auth in this case)
    async getPhotos(page = 1, limit = 9) { // Test purposes
        const response = await fetch(`/log/api/photos?page=${page}&limit=${limit}`, {
            headers: this.getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch photos: ${response.status}`);
        }
        return response.json();
    },

    async getPhotosByTag(tag) {
        const response = await fetch(`/log/api/photos/tag/${tag}`, {
            headers: this.getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch photos by tag: ${response.status}`);
        }
        return response.json();
    },

    // Protected methods
    async addPhoto(photoData) {
        const response = await fetch('/log/api/photos', {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(photoData)
        });
        if (!response.ok) {
            throw new Error(`Failed to add photo: ${response.status}`);
        }
        return response.json();
    },

    async uploadPhoto(formData) {
        const token = localStorage.getItem('token');
        const response = await fetch('/log/api/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        if (!response.ok) {
            throw new Error(`Failed to upload photo: ${response.status}`);
        }
        return response.json();
    },

    async deletePhoto(photoId) {
      const response = await fetch(`/log/api/photos/${photoId}`, {
         method: 'DELETE',
         headers: this.getAuthHeaders()
      });
      if (!response.ok) {
          throw new Error(`Failed to delete photo: ${response.status}`);
        }
        return response.json();
    },

    isAuthenticated() {
        const token = localStorage.getItem('token');
        return !!token;
    },

    logout() {
        localStorage.removeItem('token');
        window.location.href = '/log/auth.html';
    }
};
