/**
 * Photo Log Widget Plugin
 * Embeddable photo gallery widget for websites
 * 
 * Usage:
 * <div id="photo-log-widget"></div>
 * <script>
 *   PhotoLogWidget.init({
 *     containerId: 'photo-log-widget',
 *     apiUrl: 'https://your-photo-log-domain.com/log',
 *     autoplay: false,
 *     showTitle: true,
 *     showDescription: true,
 *     showDate: true
 *   });
 * </script>
 */
(function() {
    'use strict';
    
    const PhotoLogWidget = {
        // Default configuration
        config: {
            containerId: 'photo-log-widget',
            apiUrl: '',
            autoplay: false,
            autoplayInterval: 5000,
            showTitle: true,
            showDescription: true,
            showDate: true,
            showNavigation: true,
            limit: 9999
        },

        // Current state
        state: {
            photos: [],
            currentIndex: 0,
            isLoading: false,
            container: null
        },

        // Initialize the widget
        init: function(options = {}) {
            this.config = { ...this.config, ...options };
            this.state.container = document.getElementById(this.config.containerId);
            
            if (!this.state.container) {
                console.error('PhotoLogWidget: Container element not found');
                return;
            }

            if (!this.config.apiUrl) {
                console.error('PhotoLogWidget: API URL is required');
                return;
            }

            this.injectStyles();
            this.loadPhotos();
        },

        // Inject CSS styles
        injectStyles: function() {
            const existingStyles = document.getElementById('photo-log-widget-styles');
            if (existingStyles) {
                existingStyles.remove();
            }

            const styles = `
                .photo-log-widget {
                    overflow: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }

                .photo-log-widget * {
                    box-sizing: border-box;
                }

                .plw-photo-container {
                    position: relative;
                    width: 100%;
                    padding-bottom: 66.67%;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .plw-photo {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: opacity 0.4s ease;
                }

                .plw-photo.loading {
                    opacity: 0.7;
                }

                .plw-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                }

                .plw-content {
                    padding: 20px;
                    width: 100%;
                    overflow-wrap: break-word;
                    word-wrap: break-word;
                    word-break: break-word;
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 0;
                }

                .plw-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin: 0 0 8px 0;
                    width: 100%;
                    cursor: help;
                }

                .plw-description {
                    font-size: 14px;
                    line-height: 1.5;
                    margin: 0 0 16px 0;
                    width: 100%;
                    flex: 1;
                    overflow-y: auto;
                }

                .plw-navigation {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    width: 100%;
                    gap: 10px;
                    margin-top: auto;
                    flex-shrink: 0;
                }

                .plw-nav-button {
                    border: none;
                    border-radius: 8px;
                    width: 40px;
                    min-width: 40px;
                    height: 40px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    flex-shrink: 0;
                }

                .plw-nav-button:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .plw-date {
                    font-weight: 500;
                    flex-grow: 1;
                    text-align: center;
                    margin: 0 12px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    cursor: help;
                }

                .plw-counter {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                    z-index: 1;
                }

                .plw-error {
                    padding: 20px;
                    text-align: center;
                    color: #e74c3c;
                }
            `;

            const styleSheet = document.createElement('style');
            styleSheet.id = 'photo-log-widget-styles';
            styleSheet.textContent = styles;
            document.head.appendChild(styleSheet);
        },

        // Load photos from API
        loadPhotos: async function() {
            this.state.isLoading = true;
            this.renderLoading();

            try {
                const response = await fetch(`${this.config.apiUrl}/api/widget/photos?limit=${this.config.limit}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                this.state.photos = data.photos || [];
                
                if (this.state.photos.length === 0) {
                    this.renderError('No photos available');
                    return;
                }

                this.state.currentIndex = 0;
                this.render();
                
                if (this.config.autoplay && this.state.photos.length > 1) {
                    this.startAutoplay();
                }
            } catch (error) {
                console.error('PhotoLogWidget: Failed to load photos', error);
                this.renderError('Failed to load photos');
            } finally {
                this.state.isLoading = false;
            }
        },

        // Render loading state
        renderLoading: function() {
            this.state.container.innerHTML = `
                <div class="photo-log-widget">
                    <div class="plw-photo-container">
                        <div class="plw-loading">Loading photos...</div>
                    </div>
                </div>
            `;
        },

        // Render error state
        renderError: function(message) {
            this.state.container.innerHTML = `
                <div class="photo-log-widget">
                    <div class="plw-error">${message}</div>
                </div>
            `;
        },

        // Main render function
        render: function() {
            if (this.state.photos.length === 0) return;

            // Store existing styles if widget exists
            const existingWidget = this.state.container.querySelector('.photo-log-widget');
            let existingStyles = null;
            if (existingWidget) {
                existingStyles = {
                    width: existingWidget.style.width,
                    backgroundColor: existingWidget.style.backgroundColor,
                    borderRadius: existingWidget.style.borderRadius,
                    boxShadow: existingWidget.style.boxShadow,
                    titleColor: existingWidget.querySelector('.plw-title')?.style.color,
                    descriptionColor: existingWidget.querySelector('.plw-description')?.style.color,
                    dateColor: existingWidget.querySelector('.plw-date')?.style.color,
                    buttonStyles: Array.from(existingWidget.querySelectorAll('.plw-nav-button')).map(btn => ({
                        backgroundColor: btn.style.backgroundColor,
                        color: btn.style.color,
                        borderRadius: btn.style.borderRadius
                    }))[0]
                };
            }

            const photo = this.state.photos[this.state.currentIndex];
            let photoUrl;
            if (photo.filename.startsWith('http')) {
                photoUrl = photo.filename;
            } else if (photo.filename.startsWith('/uploads/')) {
                photoUrl = `${this.config.apiUrl}${photo.filename}`;
            } else if (photo.filename.startsWith('/log/uploads/')) {
                photoUrl = `${this.config.apiUrl}${photo.filename.substring(4)}`;
            } else {
                photoUrl = `${this.config.apiUrl}/uploads/${photo.filename}`;
            }

            const html = `
                <div class="photo-log-widget">
                    <div class="plw-photo-container">
                        <img class="plw-photo" src="${photoUrl}" alt="${photo.title || 'Photo'}" loading="lazy">
                        ${this.state.photos.length > 1 ? `<div class="plw-counter">${this.state.currentIndex + 1} / ${this.state.photos.length}</div>` : ''}
                    </div>
                    <div class="plw-content">
                        ${this.config.showTitle && photo.title ? `<h3 class="plw-title" title="${this.escapeHtml(photo.title)}">${this.escapeHtml(photo.title)}</h3>` : ''}
                        ${this.config.showDescription && photo.description ? `<p class="plw-description">${this.escapeHtml(photo.description)}</p>` : ''}
                        ${this.config.showNavigation && this.state.photos.length > 1 ? this.renderNavigation() : ''}
                    </div>
                </div>
            `;

            this.state.container.innerHTML = html;

            if (existingStyles) {
                const newWidget = this.state.container.querySelector('.photo-log-widget');
                if (newWidget) {
                    newWidget.style.width = existingStyles.width;
                    newWidget.style.backgroundColor = existingStyles.backgroundColor;
                    newWidget.style.borderRadius = existingStyles.borderRadius;
                    newWidget.style.boxShadow = existingStyles.boxShadow;

                    const title = newWidget.querySelector('.plw-title');
                    if (title && existingStyles.titleColor) {
                        title.style.color = existingStyles.titleColor;
                    }

                    const description = newWidget.querySelector('.plw-description');
                    if (description && existingStyles.descriptionColor) {
                        description.style.color = existingStyles.descriptionColor;
                    }

                    const date = newWidget.querySelector('.plw-date');
                    if (date && existingStyles.dateColor) {
                        date.style.color = existingStyles.dateColor;
                    }

                    if (existingStyles.buttonStyles) {
                        const buttons = newWidget.querySelectorAll('.plw-nav-button');
                        buttons.forEach(button => {
                            button.style.backgroundColor = existingStyles.buttonStyles.backgroundColor;
                            button.style.color = existingStyles.buttonStyles.color;
                            button.style.borderRadius = existingStyles.buttonStyles.borderRadius;
                        });
                    }
                }
            }

            this.attachEventListeners();
        },

        // Render navigation controls
        renderNavigation: function() {
            const photo = this.state.photos[this.state.currentIndex];
            const date = new Date(photo.date_created).toLocaleDateString();
            const fullDate = new Date(photo.date_created).toLocaleString();

            return `
                <div class="plw-navigation">
                    <button class="plw-nav-button" id="plw-prev" ${this.state.currentIndex === 0 ? 'disabled' : ''}>
                        ←
                    </button>
                    ${this.config.showDate ? `<div class="plw-date" title="${fullDate}">${date}</div>` : ''}
                    <button class="plw-nav-button" id="plw-next" ${this.state.currentIndex === this.state.photos.length - 1 ? 'disabled' : ''}>
                        →
                    </button>
                </div>
            `;
        },

        // Attach event listeners
        attachEventListeners: function() {
            const prevBtn = document.getElementById('plw-prev');
            const nextBtn = document.getElementById('plw-next');

            if (prevBtn) {
                prevBtn.addEventListener('click', () => this.previousPhoto());
            }
            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.nextPhoto());
            }

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (!this.state.container.contains(document.activeElement)) return;
                
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.previousPhoto();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.nextPhoto();
                }
            });
        },

        // Navigate to previous photo
        previousPhoto: function() {
            if (this.state.currentIndex > 0) {
                this.state.currentIndex--;
                this.render();
                this.resetAutoplay();
            }
        },

        // Navigate to next photo
        nextPhoto: function() {
            if (this.state.currentIndex < this.state.photos.length - 1) {
                this.state.currentIndex++;
                this.render();
                this.resetAutoplay();
            }
        },

        // Start autoplay
        startAutoplay: function() {
            this.autoplayInterval = setInterval(() => {
                if (this.state.currentIndex < this.state.photos.length - 1) {
                    this.nextPhoto();
                } else {
                    this.state.currentIndex = 0;
                    this.render();
                }
            }, this.config.autoplayInterval);
        },

        // Reset autoplay
        resetAutoplay: function() {
            if (this.autoplayInterval) {
                clearInterval(this.autoplayInterval);
                if (this.config.autoplay) {
                    this.startAutoplay();
                }
            }
        },

        // Utility function to escape HTML
        escapeHtml: function(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        // Public methods for external control
        goToPhoto: function(index) {
            if (index >= 0 && index < this.state.photos.length) {
                this.state.currentIndex = index;
                this.render();
                this.resetAutoplay();
            }
        },

        getCurrentPhoto: function() {
            return this.state.photos[this.state.currentIndex];
        },

        getTotalPhotos: function() {
            return this.state.photos.length;
        },

        // Add reload method for external use
        reload: function(options = {}) {
            this.config = { ...this.config, ...options };
            this.state.currentIndex = 0;
            this.loadPhotos();
        }
    };

    // Make PhotoLogWidget globally available
    window.PhotoLogWidget = PhotoLogWidget;

    // Auto-initialize if data attributes are present
    document.addEventListener('DOMContentLoaded', function() {
        const widgets = document.querySelectorAll('[data-photo-log-widget]');
        widgets.forEach(widget => {
            const config = {
                containerId: widget.id,
                apiUrl: widget.dataset.apiUrl,
                autoplay: widget.dataset.autoplay === 'true',
                autoplayInterval: parseInt(widget.dataset.autoplayInterval) || 5000,
                showTitle: widget.dataset.showTitle !== 'false',
                showDescription: widget.dataset.showDescription !== 'false',
                showDate: widget.dataset.showDate !== 'false',
                limit: parseInt(widget.dataset.limit) || 9999
            };
            PhotoLogWidget.init(config);
        });
    });
})();