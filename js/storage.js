/**
 * Storage module for PKU Exchange Calculator
 * Handles all localStorage operations for settings, favorites, and history
 */

const Storage = {
    KEYS: {
        SETTINGS: 'pku_settings',
        FAVORITES: 'pku_favorites',
        HISTORY: 'pku_history',
        THEME: 'pku_theme'
    },

    // Default settings
    defaultSettings: {
        exchangeValue: 1.2
    },

    /**
     * Get settings from storage
     */
    getSettings() {
        try {
            const stored = localStorage.getItem(this.KEYS.SETTINGS);
            if (stored) {
                return { ...this.defaultSettings, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.error('Error reading settings:', e);
        }
        return { ...this.defaultSettings };
    },

    /**
     * Save settings to storage
     */
    saveSettings(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Error saving settings:', e);
            return false;
        }
    },

    /**
     * Get theme preference
     */
    getTheme() {
        try {
            return localStorage.getItem(this.KEYS.THEME) || 'light';
        } catch (e) {
            return 'light';
        }
    },

    /**
     * Save theme preference
     */
    saveTheme(theme) {
        try {
            localStorage.setItem(this.KEYS.THEME, theme);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Get favorites list
     */
    getFavorites() {
        try {
            const stored = localStorage.getItem(this.KEYS.FAVORITES);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error reading favorites:', e);
        }
        return [];
    },

    /**
     * Add a favorite
     */
    addFavorite(favorite) {
        try {
            const favorites = this.getFavorites();
            // Generate unique ID
            favorite.id = Date.now().toString();
            favorite.createdAt = new Date().toISOString();
            favorites.unshift(favorite);
            localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(favorites));
            return true;
        } catch (e) {
            console.error('Error adding favorite:', e);
            return false;
        }
    },

    /**
     * Remove a favorite by ID
     */
    removeFavorite(id) {
        try {
            const favorites = this.getFavorites();
            const filtered = favorites.filter(f => f.id !== id);
            localStorage.setItem(this.KEYS.FAVORITES, JSON.stringify(filtered));
            return true;
        } catch (e) {
            console.error('Error removing favorite:', e);
            return false;
        }
    },

    /**
     * Get calculation history
     */
    getHistory() {
        try {
            const stored = localStorage.getItem(this.KEYS.HISTORY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error reading history:', e);
        }
        return [];
    },

    /**
     * Add to history
     */
    addToHistory(entry) {
        try {
            const history = this.getHistory();
            entry.id = Date.now().toString();
            entry.timestamp = new Date().toISOString();
            history.unshift(entry);
            // Keep only last 50 entries
            const trimmed = history.slice(0, 50);
            localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(trimmed));
            return true;
        } catch (e) {
            console.error('Error adding to history:', e);
            return false;
        }
    },

    /**
     * Clear all history
     */
    clearHistory() {
        try {
            localStorage.setItem(this.KEYS.HISTORY, JSON.stringify([]));
            return true;
        } catch (e) {
            console.error('Error clearing history:', e);
            return false;
        }
    },

    /**
     * Remove single history entry
     */
    removeFromHistory(id) {
        try {
            const history = this.getHistory();
            const filtered = history.filter(h => h.id !== id);
            localStorage.setItem(this.KEYS.HISTORY, JSON.stringify(filtered));
            return true;
        } catch (e) {
            console.error('Error removing from history:', e);
            return false;
        }
    }
};
