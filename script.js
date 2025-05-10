// Main App Controller
class RadioApp {
    constructor() {
        // DOM Elements
        this.elements = {
            // Player controls
            playBtn: document.getElementById('playBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            muteBtn: document.getElementById('muteBtn'),
            volumeSlider: document.getElementById('volumeSlider'),
            currentChannel: document.getElementById('currentChannel'),
            
            // UI Controls
            quickAccessBtn: document.getElementById('quickAccessBtn'),
            sleepTimerBtn: document.getElementById('sleepTimerBtn'),
            addChannelBtn: document.getElementById('addChannelBtn'),
            addFirstChannelBtn: document.getElementById('addFirstChannelBtn'),
            manageBtn: document.getElementById('manageBtn'),
            searchInput: document.getElementById('searchInput'),
            themeToggle: document.getElementById('themeToggle'),
            
            // Lists
            channelList: document.getElementById('channelList'),
            quickAccessList: document.getElementById('quickAccessList'),
            emptyState: document.getElementById('emptyState'),
            
            // Tabs
            tabs: document.querySelectorAll('.tab'),
            
            // Popups
            popups: {
                quickAccess: document.getElementById('quickAccessPopup'),
                channelForm: document.getElementById('channelFormPopup'),
                sleepTimer: document.getElementById('sleepTimerPopup'),
                manage: document.getElementById('managePopup'),
                loading: document.getElementById('loadingPopup')
            },
            
            // Form elements
            channelFormTitle: document.getElementById('channelFormTitle'),
            channelName: document.getElementById('channelName'),
            channelUrl: document.getElementById('channelUrl'),
            channelGenre: document.getElementById('channelGenre'),
            channelImage: document.getElementById('channelImage'),
            submitChannelBtn: document.getElementById('submitChannelBtn'),
            
            // Timer elements
            timerHours: document.getElementById('timerHours'),
            timerMinutes: document.getElementById('timerMinutes'),
            timerDisplay: document.getElementById('timerDisplay'),
            setTimerBtn: document.getElementById('setTimerBtn'),
            clearTimerBtn: document.getElementById('clearTimerBtn'),
            
            // Manage elements
            exportBtn: document.getElementById('exportBtn'),
            importBtn: document.getElementById('importBtn'),
            importFile: document.getElementById('importFile'),
            editChannelBtn: document.getElementById('editChannelBtn'),
            deleteAllBtn: document.getElementById('deleteAllBtn')
        };
        
        // Audio element
        this.audio = new Audio();
        this.audio.volume = this.elements.volumeSlider.value;
        
        // App state
        this.state = {
            channels: [],
            favorites: [],
            recent: [],
            currentChannelIndex: -1,
            isPlaying: false,
            isMuted: false,
            timer: null,
            editIndex: -1,
            activeTab: 'all',
            searchQuery: '',
            darkMode: true
        };
        
        // Initialize the app
        this.init();
    }
    
    init() {
        // Load data from localStorage
        this.loadData();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Render initial UI
        this.render();
        
        // Play first channel if available
        if (this.state.channels.length > 0) {
            this.playChannel(0);
        } else {
            this.elements.emptyState.style.display = 'block';
        }
    }
    
    loadData() {
        // Load channels
        const savedChannels = localStorage.getItem('radioChannels');
        this.state.channels = savedChannels ? JSON.parse(savedChannels) : [
            {
                name: "Ulysse FM",
                url: "http://51.178.31.38:8000/stream",
                genre: "Variety",
                image: "https://cdn-radiotime-logos.tunein.com/s107827q.png"
            },
            {
                name: "Hits Europe",
                url: "https://stream2.superfm.lv:8000/ehr.aac",
                genre: "Pop",
                image: "https://cdn-radiotime-logos.tunein.com/s24928q.png"
            },
            {
                name: "Absolute Classic Hits",
                url: "http://94media.net/stations/jimfm/jim128.pls",
                genre: "Classic Rock",
                image: "https://cdn-radiotime-logos.tunein.com/s107827q.png"
            },
            {
                name: "Rádio Mais POP FM",
                url: "http://stream.zeno.fm/dx838nn9e8zuv.acc",
                genre: "Pop",
                image: "https://cdn-radiotime-logos.tunein.com/s107827q.png"
            }
        ];
        
        // Load favorites
        const savedFavorites = localStorage.getItem('radioFavorites');
        this.state.favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
        
        // Load recent
        const savedRecent = localStorage.getItem('radioRecent');
        this.state.recent = savedRecent ? JSON.parse(savedRecent) : [];
        
        // Load settings
        const savedSettings = localStorage.getItem('radioSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.state.darkMode = settings.darkMode !== undefined ? settings.darkMode : true;
            this.audio.volume = settings.volume !== undefined ? settings.volume : 0.7;
            this.elements.volumeSlider.value = this.audio.volume;
            
            // Apply theme
            document.body.classList.toggle('light-theme', !this.state.darkMode);
            const icon = this.elements.themeToggle.querySelector('i');
            icon.className = this.state.darkMode ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
    
    saveData() {
        localStorage.setItem('radioChannels', JSON.stringify(this.state.channels));
        localStorage.setItem('radioFavorites', JSON.stringify(this.state.favorites));
        localStorage.setItem('radioRecent', JSON.stringify(this.state.recent));
        localStorage.setItem('radioSettings', JSON.stringify({
            darkMode: this.state.darkMode,
            volume: this.audio.volume
        }));
    }
    
    setupEventListeners() {
        // Player controls
        this.elements.playBtn.addEventListener('click', () => this.playCurrentChannel());
        this.elements.pauseBtn.addEventListener('click', () => this.pause());
        this.elements.prevBtn.addEventListener('click', () => this.playPreviousChannel());
        this.elements.nextBtn.addEventListener('click', () => this.playNextChannel());
        this.elements.muteBtn.addEventListener('click', () => this.toggleMute());
        this.elements.volumeSlider.addEventListener('input', () => {
            this.audio.volume = this.elements.volumeSlider.value;
            this.saveData();
        });
        
        // Audio events
        this.audio.addEventListener('play', () => {
            this.state.isPlaying = true;
            this.elements.playBtn.style.display = 'none';
            this.elements.pauseBtn.style.display = 'inline-block';
        });
        
        this.audio.addEventListener('pause', () => {
            this.state.isPlaying = false;
            this.elements.pauseBtn.style.display = 'none';
            this.elements.playBtn.style.display = 'inline-block';
        });
        
        this.audio.addEventListener('error', () => {
            this.showError('Failed to play this station. Please try another one.');
            this.pause();
        });
        
        // UI controls
        this.elements.quickAccessBtn.addEventListener('click', () => this.showPopup('quickAccess'));
        this.elements.sleepTimerBtn.addEventListener('click', () => this.showPopup('sleepTimer'));
        this.elements.addChannelBtn.addEventListener('click', () => this.showAddChannelForm());
        this.elements.addFirstChannelBtn.addEventListener('click', () => this.showAddChannelForm());
        this.elements.manageBtn.addEventListener('click', () => this.showPopup('manage'));
        this.elements.searchInput.addEventListener('input', (e) => {
            this.state.searchQuery = e.target.value.toLowerCase();
            this.render();
        });
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Tabs
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.elements.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.state.activeTab = tab.dataset.tab;
                this.render();
            });
        });
        
        // Form submission
        this.elements.submitChannelBtn.addEventListener('click', () => this.saveChannel());
        
        // Timer controls
        this.elements.setTimerBtn.addEventListener('click', () => this.setSleepTimer());
        this.elements.clearTimerBtn.addEventListener('click', () => this.clearSleepTimer());
        
        // Manage controls
        this.elements.exportBtn.addEventListener('click', () => this.exportChannels());
        this.elements.importBtn.addEventListener('click', () => this.elements.importFile.click());
        this.elements.importFile.addEventListener('change', (e) => this.importChannels(e));
        this.elements.editChannelBtn.addEventListener('click', () => this.showEditChannelSelector());
        this.elements.deleteAllBtn.addEventListener('click', () => this.confirmDeleteAll());
        
        // Popup close buttons
        document.querySelectorAll('.popup-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const popup = btn.closest('.popup-overlay');
                this.hidePopup(popup);
            });
        });
        
        // Close popups when clicking outside
        document.querySelectorAll('.popup-overlay').forEach(popup => {
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    this.hidePopup(popup);
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Space to play/pause
            if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                e.preventDefault();
                if (this.state.isPlaying) {
                    this.pause();
                } else {
                    this.playCurrentChannel();
                }
            }
            
            // Arrow keys for volume
            if (e.code === 'ArrowUp') {
                e.preventDefault();
                this.audio.volume = Math.min(1, this.audio.volume + 0.1);
                this.elements.volumeSlider.value = this.audio.volume;
            }
            
            if (e.code === 'ArrowDown') {
                e.preventDefault();
                this.audio.volume = Math.max(0, this.audio.volume - 0.1);
                this.elements.volumeSlider.value = this.audio.volume;
            }
        });
    }
    
    // Player functions
    playChannel(index) {
        if (index < 0 || index >= this.state.channels.length) return;
        
        this.state.currentChannelIndex = index;
        const channel = this.state.channels[index];
        
        // Show loading indicator
        this.showLoading('Connecting to station...');
        
        // Try to play the channel
        this.audio.src = channel.url;
        this.audio.load();
        
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Update UI
                this.elements.currentChannel.textContent = channel.name;
                this.hideLoading();
                
                // Add to recent if not already there
                this.addToRecent(index);
                
                // Save state
                this.saveData();
            }).catch(error => {
                this.hideLoading();
                this.showError('Failed to play this station. Please try another one.');
                console.error('Playback failed:', error);
            });
        }
    }
    
    playCurrentChannel() {
        if (this.state.currentChannelIndex >= 0) {
            this.playChannel(this.state.currentChannelIndex);
        } else if (this.state.channels.length > 0) {
            this.playChannel(0);
        }
    }
    
    pause() {
        this.audio.pause();
    }
    
    playNextChannel() {
        if (this.state.channels.length === 0) return;
        
        let nextIndex = this.state.currentChannelIndex + 1;
        if (nextIndex >= this.state.channels.length) {
            nextIndex = 0;
        }
        this.playChannel(nextIndex);
    }
    
    playPreviousChannel() {
        if (this.state.channels.length === 0) return;
        
        let prevIndex = this.state.currentChannelIndex - 1;
        if (prevIndex < 0) {
            prevIndex = this.state.channels.length - 1;
        }
        this.playChannel(prevIndex);
    }
    
    toggleMute() {
        this.state.isMuted = !this.state.isMuted;
        this.audio.muted = this.state.isMuted;
        
        if (this.state.isMuted) {
            this.elements.muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
            this.elements.muteBtn.title = 'Unmute';
        } else {
            this.elements.muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            this.elements.muteBtn.title = 'Mute';
        }
    }
    
    // Channel management
    addToRecent(index) {
        // Remove if already exists
        this.state.recent = this.state.recent.filter(i => i !== index);
        
        // Add to beginning
        this.state.recent.unshift(index);
        
        // Keep only last 10
        if (this.state.recent.length > 10) {
            this.state.recent.pop();
        }
        
        // Save and render
        this.saveData();
        if (this.state.activeTab === 'recent') {
            this.render();
        }
    }
    
    toggleFavorite(index) {
        const favIndex = this.state.favorites.indexOf(index);
        
        if (favIndex >= 0) {
            // Remove from favorites
            this.state.favorites.splice(favIndex, 1);
        } else {
            // Add to favorites
            this.state.favorites.push(index);
        }
        
        // Save and render
        this.saveData();
        this.render();
    }
    
    showAddChannelForm() {
        this.state.editIndex = -1;
        this.elements.channelFormTitle.textContent = 'Add New Station';
        this.elements.channelName.value = '';
        this.elements.channelUrl.value = '';
        this.elements.channelGenre.value = '';
        this.elements.channelImage.value = '';
        this.elements.submitChannelBtn.textContent = 'Add Station';
        this.showPopup('channelForm');
    }
    
    showEditChannelForm(index) {
        this.state.editIndex = index;
        const channel = this.state.channels[index];
        
        this.elements.channelFormTitle.textContent = 'Edit Station';
        this.elements.channelName.value = channel.name;
        this.elements.channelUrl.value = channel.url;
        this.elements.channelGenre.value = channel.genre || '';
        this.elements.channelImage.value = channel.image || '';
        this.elements.submitChannelBtn.textContent = 'Save Changes';
        this.showPopup('channelForm');
    }
    
    showEditChannelSelector() {
        if (this.state.channels.length === 0) {
            this.showError('No stations available to edit');
            return;
        }
        
        const channelOptions = this.state.channels.map((channel, index) => ({
            text: channel.name,
            value: index
        }));
        
        this.showChannelSelector('Select a station to edit', channelOptions)
            .then(index => {
                if (index !== undefined) {
                    this.showEditChannelForm(index);
                }
            });
    }
    
    saveChannel() {
        const name = this.elements.channelName.value.trim();
        const url = this.elements.channelUrl.value.trim();
        const genre = this.elements.channelGenre.value.trim();
        const image = this.elements.channelImage.value.trim();
        
        // Validate
        if (!name || !url) {
            this.showError('Please enter both name and URL');
            return;
        }
        
        if (!this.isValidUrl(url)) {
            this.showError('Please enter a valid URL');
            return;
        }
        
        // Create channel object
        const channel = { name, url };
        if (genre) channel.genre = genre;
        if (image) channel.image = image;
        
        if (this.state.editIndex >= 0) {
            // Update existing channel
            this.state.channels[this.state.editIndex] = channel;
            
            // Update favorites and recent if name changed
            const oldName = this.state.channels[this.state.editIndex].name;
            if (name !== oldName) {
                this.saveData(); // Force update of favorites/recent
            }
            
            this.showSuccess('Station updated successfully');
        } else {
            // Add new channel
            this.state.channels.push(channel);
            this.showSuccess('Station added successfully');
            
            // If this is the first channel, play it
            if (this.state.channels.length === 1) {
                this.playChannel(0);
            }
        }
        
        // Hide empty state if needed
        if (this.state.channels.length > 0) {
            this.elements.emptyState.style.display = 'none';
        }
        
        // Save and render
        this.saveData();
        this.render();
        this.hidePopup(this.elements.popups.channelForm);
    }
    
    deleteChannel(index) {
        this.showConfirm(
            'Delete Station',
            `Are you sure you want to delete "${this.state.channels[index].name}"?`,
            'Delete'
        ).then(result => {
            if (result) {
                // Remove from channels
                this.state.channels.splice(index, 1);
                
                // Update favorites and recent
                this.state.favorites = this.state.favorites
                    .filter(i => i !== index)
                    .map(i => i > index ? i - 1 : i);
                
                this.state.recent = this.state.recent
                    .filter(i => i !== index)
                    .map(i => i > index ? i - 1 : i);
                
                // Update current channel index
                if (this.state.currentChannelIndex === index) {
                    this.state.currentChannelIndex = -1;
                    this.elements.currentChannel.textContent = 'Select a station';
                    this.pause();
                } else if (this.state.currentChannelIndex > index) {
                    this.state.currentChannelIndex--;
                }
                
                // Show empty state if no channels left
                if (this.state.channels.length === 0) {
                    this.elements.emptyState.style.display = 'block';
                }
                
                // Save and render
                this.saveData();
                this.render();
                
                this.showSuccess('Station deleted successfully');
            }
        });
    }
    
    confirmDeleteAll() {
        if (this.state.channels.length === 0) {
            this.showError('No stations to delete');
            return;
        }
        
        this.showConfirm(
            'Delete All Stations',
            'Are you sure you want to delete ALL stations? This cannot be undone!',
            'Delete All',
            true
        ).then(result => {
            if (result) {
                // Clear all data
                this.state.channels = [];
                this.state.favorites = [];
                this.state.recent = [];
                this.state.currentChannelIndex = -1;
                
                // Update UI
                this.elements.currentChannel.textContent = 'Select a station';
                this.elements.emptyState.style.display = 'block';
                this.pause();
                
                // Save and render
                this.saveData();
                this.render();
                
                this.showSuccess('All stations deleted successfully');
                this.hidePopup(this.elements.popups.manage);
            }
        });
    }
    
    exportChannels() {
        if (this.state.channels.length === 0) {
            this.showError('No stations to export');
            return;
        }
        
        const data = {
            channels: this.state.channels,
            favorites: this.state.favorites,
            recent: this.state.recent,
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'radiowave-stations.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Stations exported successfully');
    }
    
    importChannels(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data
                if (!data.channels || !Array.isArray(data.channels)) {
                    throw new Error('Invalid file format');
                }
                
                // Show confirm dialog
                this.showConfirm(
                    'Import Stations',
                    `This will import ${data.channels.length} stations. Do you want to merge with existing stations or replace them?`,
                    'Merge',
                    false,
                    'Replace'
                ).then(result => {
                    if (result === undefined) return; // Cancelled
                    
                    const isMerge = result;
                    
                    if (!isMerge) {
                        // Replace all
                        this.state.channels = data.channels;
                        this.state.favorites = data.favorites || [];
                        this.state.recent = data.recent || [];
                        this.state.currentChannelIndex = -1;
                    } else {
                        // Merge
                        const oldLength = this.state.channels.length;
                        this.state.channels = [...this.state.channels, ...data.channels];
                        
                        // Update favorites and recent indices
                        if (data.favorites) {
                            this.state.favorites = [
                                ...this.state.favorites,
                                ...data.favorites.map(i => i + oldLength)
                            ];
                        }
                        
                        if (data.recent) {
                            this.state.recent = [
                                ...this.state.recent,
                                ...data.recent.map(i => i + oldLength)
                            ];
                        }
                    }
                    
                    // Save and render
                    this.saveData();
                    this.render();
                    
                    // Hide empty state if needed
                    if (this.state.channels.length > 0) {
                        this.elements.emptyState.style.display = 'none';
                    }
                    
                    this.showSuccess(`Successfully imported ${data.channels.length} stations`);
                });
            } catch (error) {
                console.error('Import failed:', error);
                this.showError('Failed to import stations. The file may be corrupted or in the wrong format.');
            }
            
            // Reset file input
            event.target.value = '';
        };
        
        reader.readAsText(file);
    }
    
    // Sleep timer functions
    setSleepTimer() {
        const hours = parseInt(this.elements.timerHours.value);
        const minutes = parseInt(this.elements.timerMinutes.value);
        const totalMinutes = (hours * 60) + minutes;
        
        if (totalMinutes <= 0) {
            this.clearSleepTimer();
            return;
        }
        
        // Clear existing timer
        if (this.state.timer) {
            clearTimeout(this.state.timer);
        }
        
        // Set new timer
        this.state.timer = setTimeout(() => {
            this.pause();
            this.showSuccess('Sleep timer has stopped playback');
            this.elements.timerDisplay.textContent = 'Timer off';
        }, totalMinutes * 60 * 1000);
        
        // Update display
        let displayText = '';
        if (hours > 0) displayText += `${hours} hour${hours > 1 ? 's' : ''} `;
        if (minutes > 0) displayText += `${minutes} minute${minutes > 1 ? 's' : ''}`;
        this.elements.timerDisplay.textContent = `Timer set: ${displayText}`;
        
        this.hidePopup(this.elements.popups.sleepTimer);
    }
    
    clearSleepTimer() {
        if (this.state.timer) {
            clearTimeout(this.state.timer);
            this.state.timer = null;
        }
        this.elements.timerDisplay.textContent = 'Timer off';
    }
    
    // Theme functions
    toggleTheme() {
        this.state.darkMode = !this.state.darkMode;
        document.body.classList.toggle('light-theme', !this.state.darkMode);
        
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = this.state.darkMode ? 'fas fa-moon' : 'fas fa-sun';
        
        this.saveData();
    }
    
    // UI rendering
    render() {
        // Get channels based on active tab and search query
        let channelsToRender = [];
        let channelIndices = [];
        
        switch (this.state.activeTab) {
            case 'favorites':
                channelIndices = this.state.favorites;
                break;
            case 'recent':
                channelIndices = this.state.recent;
                break;
            default:
                channelIndices = Array.from({ length: this.state.channels.length }, (_, i) => i);
                break;
        }
        
        // Filter by search query if any
        if (this.state.searchQuery) {
            channelIndices = channelIndices.filter(index => {
                const channel = this.state.channels[index];
                return channel.name.toLowerCase().includes(this.state.searchQuery) ||
                       (channel.genre && channel.genre.toLowerCase().includes(this.state.searchQuery));
            });
        }
        
        // Create channel items
        this.elements.channelList.innerHTML = '';
        
        if (channelIndices.length === 0) {
            // Show empty state for this tab
            let emptyMessage = '';
            if (this.state.searchQuery) {
                emptyMessage = 'No stations match your search';
            } else {
                switch (this.state.activeTab) {
                    case 'favorites':
                        emptyMessage = 'No favorite stations yet';
                        break;
                    case 'recent':
                        emptyMessage = 'No recently played stations';
                        break;
                    default:
                        emptyMessage = 'No stations available';
                        break;
                }
            }
            
            this.elements.channelList.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-${this.state.searchQuery ? 'search' : 'broadcast-tower'}"></i>
                    <h3>${emptyMessage}</h3>
                </div>
            `;
        } else {
            // Render channels
            channelIndices.forEach(index => {
                const channel = this.state.channels[index];
                const isFavorite = this.state.favorites.includes(index);
                const isCurrent = this.state.currentChannelIndex === index;
                
                const channelItem = document.createElement('div');
                channelItem.className = `channel-item ${isCurrent ? 'pulse' : ''}`;
                channelItem.innerHTML = `
                    <div class="channel-img">
                        ${channel.image ? 
                            `<img src="${channel.image}" alt="${channel.name}" onerror="this.parentNode.innerHTML='<i class=\\'fas fa-broadcast-tower\\'></i>'">` : 
                            `<i class="fas fa-broadcast-tower"></i>`}
                    </div>
                    <div class="channel-content">
                        <h3 class="channel-name">${channel.name}</h3>
                        ${channel.genre ? `<div class="channel-genre">${channel.genre}</div>` : ''}
                        <div class="channel-actions">
                            <button class="action-btn play-btn" data-index="${index}">
                                <i class="fas fa-play"></i> Play
                            </button>
                            <button class="action-btn fav-btn ${isFavorite ? 'favorited' : ''}" data-index="${index}">
                                <i class="fas fa-heart"></i>
                            </button>
                            <button class="action-btn more-btn" data-index="${index}">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                this.elements.channelList.appendChild(channelItem);
            });
            
            // Add event listeners to the buttons
            document.querySelectorAll('.play-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    this.playChannel(index);
                });
            });
            
            document.querySelectorAll('.fav-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    this.toggleFavorite(index);
                });
            });
            
            document.querySelectorAll('.more-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    this.showChannelContextMenu(index, e);
                });
            });
        }
        
        // Render quick access list
        this.renderQuickAccessList();
    }
    
    renderQuickAccessList() {
        this.elements.quickAccessList.innerHTML = '';
        
        // Show up to 10 recently played stations
        const recentToShow = this.state.recent.slice(0, 10);
        
        if (recentToShow.length === 0) {
            this.elements.quickAccessList.innerHTML = `
                <div class="empty-state" style="padding: 20px 0;">
                    <i class="fas fa-history"></i>
                    <p>No recently played stations</p>
                </div>
            `;
        } else {
            recentToShow.forEach(index => {
                const channel = this.state.channels[index];
                const isCurrent = this.state.currentChannelIndex === index;
                
                const channelItem = document.createElement('div');
                channelItem.className = `channel-item ${isCurrent ? 'pulse' : ''}`;
                channelItem.innerHTML = `
                    <div class="channel-img">
                        ${channel.image ? 
                            `<img src="${channel.image}" alt="${channel.name}" onerror="this.parentNode.innerHTML='<i class=\\'fas fa-broadcast-tower\\'></i>'">` : 
                            `<i class="fas fa-broadcast-tower"></i>`}
                    </div>
                    <div class="channel-content">
                        <h3 class="channel-name">${channel.name}</h3>
                        <button class="action-btn play-btn" data-index="${index}">
                            <i class="fas fa-play"></i>
                        </button>
                    </div>
                `;
                
                channelItem.querySelector('.play-btn').addEventListener('click', () => {
                    this.playChannel(index);
                    this.hidePopup(this.elements.popups.quickAccess);
                });
                
                this.elements.quickAccessList.appendChild(channelItem);
            });
        }
    }
    
    showChannelContextMenu(index, event) {
        const channel = this.state.channels[index];
        const isFavorite = this.state.favorites.includes(index);
        
        const menuItems = [
            {
                text: isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
                icon: isFavorite ? 'fa-heart-broken' : 'fa-heart',
                action: () => this.toggleFavorite(index)
            },
            {
                text: 'Edit Station',
                icon: 'fa-edit',
                action: () => this.showEditChannelForm(index)
            },
            {
                text: 'Delete Station',
                icon: 'fa-trash',
                danger: true,
                action: () => this.deleteChannel(index)
            }
        ];
        
        // Create menu
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        
        // Position the menu above the clicked button
        const buttonRect = event.currentTarget.getBoundingClientRect();
        const menuTop = buttonRect.top - (menuItems.length * 40) - 10; // 40px per item, 10px padding
        
        menu.style.position = 'fixed';
        menu.style.left = `${buttonRect.left}px`;
        menu.style.top = `${Math.max(10, menuTop)}px`; // Ensure it doesn't go above viewport
        menu.style.zIndex = '1001';
        
        // Add menu items
        menuItems.forEach(item => {
            const menuItem = document.createElement('button');
            menuItem.className = `menu-item ${item.danger ? 'danger' : ''}`;
            menuItem.innerHTML = `
                <i class="fas ${item.icon}"></i>
                <span>${item.text}</span>
            `;
            
            menuItem.addEventListener('click', () => {
                item.action();
                document.body.removeChild(menu);
            });
            
            menu.appendChild(menuItem);
        });
        
        // Add to document
        document.body.appendChild(menu);
        
        // Close menu when clicking outside
        const closeMenu = (e) => {
            if (!menu.contains(e.target) && e.target !== event.currentTarget) {
                document.body.removeChild(menu);
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 100);
    }
    
    // Popup functions
    showPopup(name) {
        this.elements.popups[name].classList.add('active');
    }
    
    hidePopup(popup) {
        popup.classList.remove('active');
    }
    
    showLoading(message) {
        document.getElementById('loadingText').textContent = message || 'Loading...';
        this.elements.popups.loading.classList.add('active');
    }
    
    hideLoading() {
        this.elements.popups.loading.classList.remove('active');
    }
    
    // Utility functions
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
    
    showChannelSelector(title, options) {
        return new Promise(resolve => {
            const optionElements = options.map(option => 
                `<option value="${option.value}">${option.text}</option>`
            ).join('');
            
            Swal.fire({
                title: title,
                html: `
                    <select id="channelSelect" class="swal2-select" style="width: 100%; margin: 10px 0;">
                        ${optionElements}
                    </select>
                `,
                showCancelButton: true,
                confirmButtonText: 'Select',
                cancelButtonText: 'Cancel',
                background: '#333',
                color: '#fff',
                iconColor: 'var(--primary)',
                focusConfirm: false,
                preConfirm: () => {
                    const select = document.getElementById('channelSelect');
                    return select ? parseInt(select.value) : undefined;
                }
            }).then(result => {
                resolve(result.isConfirmed ? result.value : undefined);
            });
        });
    }
    
    showError(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            background: '#333',
            color: '#fff',
            iconColor: 'var(--danger)'
        });
    }
    
    showSuccess(message) {
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            background: '#333',
            color: '#fff',
            iconColor: 'var(--success)',
            timer: 2000,
            showConfirmButton: false
        });
    }
    
    showConfirm(title, text, confirmText, danger = false, cancelText = 'Cancel') {
        return Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            background: '#333',
            color: '#fff',
            iconColor: 'var(--warning)',
            confirmButtonColor: danger ? 'var(--danger)' : 'var(--primary)'
        }).then(result => {
            return result.isConfirmed;
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new RadioApp();
    
    // Make app available globally for debugging
    window.radioApp = app;
});
class RadioApp {
    constructor() {
        // ... your complete original implementation ...
    }

    // ... all your original methods ...
}

document.addEventListener('DOMContentLoaded', () => {
    new RadioApp();
});