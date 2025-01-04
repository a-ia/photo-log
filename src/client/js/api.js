const API = {
  // authentication methods
  async login(password) {
    const response = await fetch('/log/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  },

  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  },

  // public methods (no authentication required)
  async getPhotos(page = 1, limit = 5) {
    const response = await fetch(`/log/api/photos?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch photos');
    }
    return response.json();
  },

  async getPhotosByTag(tag) {
    const response = await fetch(`/log/api/photos/tag/${tag}`);
    if (!response.ok) {
      throw new Error('Failed to fetch photos by tag');
    }
    return response.json();
  },

  // protected methods (authentication required)
  async addPhoto(photoData) {
    const response = await fetch('/log/api/photos', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(photoData)
    });
    if (!response.ok) {
      throw new Error('Failed to add photo');
    }
    return response.json();
  },

  async uploadPhoto(formData) {
    const token = localStorage.getItem('token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch('/log/api/upload', {
      method: 'POST',
      headers,
      body: formData
    });
    if (!response.ok) {
      throw new Error('Failed to upload photo');
    }
    return response.json();
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  logout() {
    localStorage.removeItem('token');
  }
};
