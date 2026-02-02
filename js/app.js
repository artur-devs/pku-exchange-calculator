/**
 * PKU Exchange Calculator - Main Application
 */

(function() {
    'use strict';

    // DOM Elements
    const elements = {
        // Tabs
        tabs: document.querySelectorAll('.tab'),
        tabContents: document.querySelectorAll('.tab-content'),

        // Theme
        themeToggle: document.getElementById('theme-toggle'),
        themeToggleSettings: document.getElementById('theme-toggle-settings'),

        // Calculator
        foodName: document.getElementById('food-name'),
        proteinValue: document.getElementById('protein-value'),
        servingSize: document.getElementById('serving-size'),
        calculateBtn: document.getElementById('calculate-btn'),
        result: document.getElementById('result'),
        freeFoodBadge: document.getElementById('free-food-badge'),
        halfExchangeRow: document.getElementById('half-exchange-row'),
        halfExchangeGrams: document.getElementById('half-exchange-grams'),
        oneExchangeRow: document.getElementById('one-exchange-row'),
        oneExchangeGrams: document.getElementById('one-exchange-grams'),
        oneHalfExchangeRow: document.getElementById('one-half-exchange-row'),
        oneHalfExchangeGrams: document.getElementById('one-half-exchange-grams'),
        twoExchangeRow: document.getElementById('two-exchange-row'),
        twoExchangeGrams: document.getElementById('two-exchange-grams'),
        exchangesPerServing: document.getElementById('exchanges-per-serving'),
        resultServing: document.getElementById('result-serving'),
        saveFavoriteBtn: document.getElementById('save-favorite-btn'),

        // Reverse Calculator
        reverseGrams: document.getElementById('reverse-grams'),
        reverseExchanges: document.getElementById('reverse-exchanges'),

        // Favorites
        favoritesList: document.getElementById('favorites-list'),

        // History
        historyList: document.getElementById('history-list'),
        clearHistoryBtn: document.getElementById('clear-history-btn'),

        // Settings
        exchangeValueInput: document.getElementById('exchange-value'),

        // Install
        installPrompt: document.getElementById('install-prompt'),
        installBtn: document.getElementById('install-btn'),
        dismissInstall: document.getElementById('dismiss-install')
    };

    // State
    let state = {
        settings: Storage.getSettings(),
        currentCalculation: null,
        deferredPrompt: null
    };

    /**
     * Initialize the application
     */
    function init() {
        loadTheme();
        loadSettings();
        setupEventListeners();
        renderFavorites();
        renderHistory();
        registerServiceWorker();
    }

    /**
     * Load and apply theme
     */
    function loadTheme() {
        const theme = Storage.getTheme();
        applyTheme(theme);
    }

    /**
     * Apply theme to document
     */
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (elements.themeToggleSettings) {
            elements.themeToggleSettings.classList.toggle('active', theme === 'dark');
        }
    }

    /**
     * Toggle theme
     */
    function toggleTheme() {
        const current = Storage.getTheme();
        const newTheme = current === 'dark' ? 'light' : 'dark';
        Storage.saveTheme(newTheme);
        applyTheme(newTheme);
    }

    /**
     * Load settings
     */
    function loadSettings() {
        state.settings = Storage.getSettings();
        if (elements.exchangeValueInput) {
            elements.exchangeValueInput.value = state.settings.exchangeValue;
        }
    }

    /**
     * Save settings
     */
    function saveSettings() {
        const exchangeValue = parseFloat(elements.exchangeValueInput.value) || 1.2;
        state.settings.exchangeValue = exchangeValue;
        Storage.saveSettings(state.settings);
        showToast('Settings saved');
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Tab navigation
        elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });

        // Theme toggles
        elements.themeToggle?.addEventListener('click', toggleTheme);
        elements.themeToggleSettings?.addEventListener('click', toggleTheme);

        // Calculator
        elements.calculateBtn?.addEventListener('click', calculate);
        elements.saveFavoriteBtn?.addEventListener('click', saveFavorite);

        // Reverse calculator - live calculation
        elements.reverseGrams?.addEventListener('input', calculateFromGrams);
        elements.reverseExchanges?.addEventListener('input', calculateFromExchanges);

        // History
        elements.clearHistoryBtn?.addEventListener('click', clearHistory);

        // Settings
        elements.exchangeValueInput?.addEventListener('change', saveSettings);

        // Install prompt
        elements.installBtn?.addEventListener('click', installApp);
        elements.dismissInstall?.addEventListener('click', dismissInstallPrompt);

        // PWA install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            state.deferredPrompt = e;
            showInstallPrompt();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && document.activeElement.closest('#calculator')) {
                calculate();
            }
        });
    }

    /**
     * Switch active tab
     */
    function switchTab(tabName) {
        elements.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        elements.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === tabName);
        });
    }

    /**
     * Main calculation function
     */
    function calculate() {
        const protein = parseFloat(elements.proteinValue.value);
        const serving = parseFloat(elements.servingSize.value) || 100;
        const exchangeValue = state.settings.exchangeValue;

        if (!protein || protein <= 0) {
            showToast('Please enter a valid protein value');
            elements.proteinValue.focus();
            return;
        }

        // Calculate grams per exchange
        // Formula: serving * exchangeValue / protein
        const gramsPerExchange = (serving * exchangeValue) / protein;

        // Calculate exchanges per serving
        const exchangesPerServing = protein / exchangeValue;

        // Determine exchange category based on protein content
        // Free: 0-0.3g protein per serving (less than 0.25 exchanges)
        // Half: 0.3-0.6g protein (0.25-0.5 exchanges)
        // One: 0.6-1.2g protein (0.5-1 exchanges)
        // etc.
        const isFree = protein <= (exchangeValue * 0.25);
        const isHalfExchange = protein > (exchangeValue * 0.25) && protein <= (exchangeValue * 0.5);

        // Store current calculation
        state.currentCalculation = {
            name: elements.foodName.value.trim() || 'Unnamed food',
            protein: protein,
            serving: serving,
            gramsPerExchange: gramsPerExchange,
            exchangesPerServing: exchangesPerServing,
            exchangeValue: exchangeValue,
            isFree: isFree
        };

        // Calculate grams for different exchange amounts
        const halfGrams = gramsPerExchange * 0.5;
        const oneGrams = gramsPerExchange;
        const oneHalfGrams = gramsPerExchange * 1.5;
        const twoGrams = gramsPerExchange * 2;

        // Display free food badge
        if (isFree) {
            elements.freeFoodBadge.classList.remove('hidden');
        } else {
            elements.freeFoodBadge.classList.add('hidden');
        }

        // Display exchange table values
        elements.halfExchangeGrams.textContent = formatNumber(halfGrams) + 'g';
        elements.oneExchangeGrams.textContent = formatNumber(oneGrams) + 'g';
        elements.oneHalfExchangeGrams.textContent = formatNumber(oneHalfGrams) + 'g';
        elements.twoExchangeGrams.textContent = formatNumber(twoGrams) + 'g';

        // Highlight appropriate row based on protein content
        elements.halfExchangeRow.classList.toggle('highlight', isHalfExchange);
        elements.oneExchangeRow.classList.toggle('highlight', !isFree && !isHalfExchange);

        // Dim rows that are less relevant for free foods
        elements.halfExchangeRow.classList.toggle('dimmed', isFree);
        elements.oneExchangeRow.classList.toggle('dimmed', isFree);
        elements.oneHalfExchangeRow.classList.toggle('dimmed', isFree);
        elements.twoExchangeRow.classList.toggle('dimmed', isFree);

        // Display exchanges per serving
        elements.exchangesPerServing.textContent = formatNumber(exchangesPerServing);
        elements.resultServing.textContent = serving;
        elements.result.classList.remove('hidden');

        // Add to history
        Storage.addToHistory(state.currentCalculation);
        renderHistory();

        // Update reverse calculator placeholder values
        elements.reverseGrams.placeholder = formatNumber(gramsPerExchange);
        elements.reverseExchanges.placeholder = '1';
    }

    /**
     * Calculate exchanges from grams (reverse calculator)
     */
    function calculateFromGrams() {
        if (!state.currentCalculation) {
            showToast('Calculate a food first');
            return;
        }

        const grams = parseFloat(elements.reverseGrams.value);
        if (grams && grams > 0) {
            const exchanges = grams / state.currentCalculation.gramsPerExchange;
            elements.reverseExchanges.value = formatNumber(exchanges);
        } else {
            elements.reverseExchanges.value = '';
        }
    }

    /**
     * Calculate grams from exchanges (reverse calculator)
     */
    function calculateFromExchanges() {
        if (!state.currentCalculation) {
            showToast('Calculate a food first');
            return;
        }

        const exchanges = parseFloat(elements.reverseExchanges.value);
        if (exchanges && exchanges > 0) {
            const grams = exchanges * state.currentCalculation.gramsPerExchange;
            elements.reverseGrams.value = formatNumber(grams);
        } else {
            elements.reverseGrams.value = '';
        }
    }

    /**
     * Save current calculation to favorites
     */
    function saveFavorite() {
        if (!state.currentCalculation) {
            showToast('Nothing to save');
            return;
        }

        const favorite = {
            name: state.currentCalculation.name,
            protein: state.currentCalculation.protein,
            serving: state.currentCalculation.serving
        };

        if (Storage.addFavorite(favorite)) {
            showToast('Saved to favorites');
            renderFavorites();
        } else {
            showToast('Failed to save');
        }
    }

    /**
     * Render favorites list
     */
    function renderFavorites() {
        const favorites = Storage.getFavorites();

        if (favorites.length === 0) {
            elements.favoritesList.innerHTML = '<p class="empty-state">No favorites saved yet. Calculate and save foods from the calculator.</p>';
            return;
        }

        elements.favoritesList.innerHTML = favorites.map(fav => `
            <div class="list-item" data-id="${fav.id}">
                <div class="list-item-info">
                    <div class="list-item-title">${escapeHtml(fav.name)}</div>
                    <div class="list-item-detail">${fav.protein}g protein per ${fav.serving}g</div>
                </div>
                <div class="list-item-actions">
                    <button class="use-btn" onclick="App.useFavorite('${fav.id}')">Use</button>
                    <button class="delete-btn" onclick="App.deleteFavorite('${fav.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Use a favorite in calculator
     */
    function useFavorite(id) {
        const favorites = Storage.getFavorites();
        const favorite = favorites.find(f => f.id === id);

        if (favorite) {
            elements.foodName.value = favorite.name;
            elements.proteinValue.value = favorite.protein;
            elements.servingSize.value = favorite.serving;
            switchTab('calculator');
            calculate();
        }
    }

    /**
     * Delete a favorite
     */
    function deleteFavorite(id) {
        if (Storage.removeFavorite(id)) {
            renderFavorites();
            showToast('Favorite removed');
        }
    }

    /**
     * Render history list
     */
    function renderHistory() {
        const history = Storage.getHistory();

        if (history.length === 0) {
            elements.historyList.innerHTML = '<p class="empty-state">No calculations yet. Use the calculator to get started.</p>';
            return;
        }

        elements.historyList.innerHTML = history.map(entry => {
            const freeLabel = entry.isFree ? '<span class="free-label">FREE</span> ' : '';
            return `
            <div class="list-item" data-id="${entry.id}">
                <div class="list-item-info">
                    <div class="list-item-title">${freeLabel}${escapeHtml(entry.name)}</div>
                    <div class="list-item-detail">
                        ${entry.protein}g protein / ${entry.serving}g = ${formatNumber(entry.gramsPerExchange)}g per exchange
                    </div>
                    <div class="list-item-detail">${formatTimestamp(entry.timestamp)}</div>
                </div>
                <div class="list-item-actions">
                    <button class="use-btn" onclick="App.useHistory('${entry.id}')">Use</button>
                    <button class="delete-btn" onclick="App.deleteHistory('${entry.id}')">Delete</button>
                </div>
            </div>
        `}).join('');
    }

    /**
     * Use a history entry in calculator
     */
    function useHistory(id) {
        const history = Storage.getHistory();
        const entry = history.find(h => h.id === id);

        if (entry) {
            elements.foodName.value = entry.name;
            elements.proteinValue.value = entry.protein;
            elements.servingSize.value = entry.serving;
            switchTab('calculator');
            calculate();
        }
    }

    /**
     * Delete a history entry
     */
    function deleteHistory(id) {
        if (Storage.removeFromHistory(id)) {
            renderHistory();
            showToast('Entry removed');
        }
    }

    /**
     * Clear all history
     */
    function clearHistory() {
        if (confirm('Clear all calculation history?')) {
            Storage.clearHistory();
            renderHistory();
            showToast('History cleared');
        }
    }

    /**
     * Show install prompt
     */
    function showInstallPrompt() {
        elements.installPrompt?.classList.remove('hidden');
    }

    /**
     * Dismiss install prompt
     */
    function dismissInstallPrompt() {
        elements.installPrompt?.classList.add('hidden');
    }

    /**
     * Install the app
     */
    async function installApp() {
        if (!state.deferredPrompt) return;

        state.deferredPrompt.prompt();
        const { outcome } = await state.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            showToast('App installed!');
        }

        state.deferredPrompt = null;
        dismissInstallPrompt();
    }

    /**
     * Register service worker
     */
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('sw.js')
                    .then(registration => {
                        console.log('SW registered:', registration.scope);
                    })
                    .catch(error => {
                        console.log('SW registration failed:', error);
                    });
            });
        }
    }

    /**
     * Show toast notification
     */
    function showToast(message, duration = 2000) {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Format number to reasonable decimal places
     */
    function formatNumber(num) {
        if (num >= 100) {
            return Math.round(num).toString();
        } else if (num >= 10) {
            return num.toFixed(1);
        } else {
            return num.toFixed(2);
        }
    }

    /**
     * Format timestamp for display
     */
    function formatTimestamp(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

        return date.toLocaleDateString();
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Expose public API for onclick handlers
    window.App = {
        useFavorite,
        deleteFavorite,
        useHistory,
        deleteHistory
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
