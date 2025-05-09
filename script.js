class RadioApp {
    constructor() {
        this.tg = window.Telegram?.WebApp || null;
        this.isTg = this.tg !== null;
        this.audio = new Audio();
        this.state = {
            channels: [],
            currentStation: null,
            isPlaying: false,
            isLoading: false
        };

        this.initElements();
        this.init();
    }

    initElements() {
        this.elements = {
            playBtn: document.getElementById('playBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            nowPlaying: document.getElementById('nowPlaying'),
            channelList: document.getElementById('channelList')
        };
    }

    init() {
        this.loadStations();
        this.setupEventListeners();
        
        if (this.isTg) {
            this.tg.expand();
            this.tg.enableClosingConfirmation();
            this.setupTheme();
        }
    }

    setupTheme() {
        const setTheme = () => {
            document.body.classList.toggle(
                'light-theme', 
                this.tg.colorScheme === 'light'
            );
        };
        
        setTheme();
        if (this.tg.onEvent) {
            this.tg.onEvent('themeChanged', setTheme);
        }
    }

    showLoading() {
        this.state.isLoading = true;
        this.elements.channelList.innerHTML = `
            <div style="grid-column:1/-1">
                <div class="spinner"></div>
            </div>
        `;
    }

    hideLoading() {
        this.state.isLoading = false;
    }

    loadStations() {
        this.showLoading();
        
        // Default stations with backup URLs
        this.state.channels = [
            {
                name: "Ulysse FM",
                url: "https://stream.radiowave.fr/radio.mp3",
                backupUrl: "http://51.178.31.38:8000/stream",
                genre: "Variety"
            },
            {
                name: "Hits Europe",
                url: "https://stream2.superfm.lv:8000/ehr.aac",
                genre: "Pop"
            },
            {
                name: "Absolute Classic Hits",
                url: "https://ais.absoluteradio.co.uk/absoluteclassichits.mp3",
                backupUrl: "http://94media.net/stations/jimfm/jim128.pls",
                genre: "Classic Rock"
            },
            {
                name: "Radio Paradise",
                url: "https://stream.radioparadise.com/flacm",
                genre: "Eclectic Mix"
            }
        ];

        setTimeout(() => {
            this.renderStations();
            this.hideLoading();
        }, 500);
    }

    renderStations() {
        this.elements.channelList.innerHTML = '';

        this.state.channels.forEach((station, index) => {
            const card = document.createElement('div');
            card.className = 'channel-card';
            card.innerHTML = `
                <div class="channel-name">${station.name}</div>
                <div class="channel-genre">${station.genre}</div>
                <div class="channel-actions">
                    <button class="action-btn play-btn" data-index="${index}">
                        <i class="fas fa-play"></i> Play
                    </button>
                </div>
            `;
            this.elements.channelList.appendChild(card);
        });

        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                this.playStation(index);
            });
        });
    }

    async playStation(index) {
        const station = this.state.channels[index];
        this.state.currentStation = station;
        
        this.elements.nowPlaying.textContent = `Now Playing: ${station.name}`;
        this.elements.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        this.state.isPlaying = true;
        
        try {
            this.audio.src = station.url;
            await this.audio.play();
        } catch (error) {
            console.error("Primary stream failed, trying backup...");
            if (station.backupUrl) {
                try {
                    this.audio.src = station.backupUrl;
                    await this.audio.play();
                } catch (backupError) {
                    this.showAlert(`Error playing ${station.name}`);
                    console.error(backupError);
                    this.stopPlayback();
                }
            } else {
                this.showAlert(`Error playing ${station.name}`);
                console.error(error);
                this.stopPlayback();
            }
        }
    }

    stopPlayback() {
        this.audio.pause();
        this.state.isPlaying = false;
        this.elements.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.elements.nowPlaying.textContent = '';
    }

    setupEventListeners() {
        this.elements.playBtn.addEventListener('click', () => {
            if (this.state.isPlaying) {
                this.audio.pause();
                this.state.isPlaying = false;
                this.elements.playBtn.innerHTML = '<i class="fas fa-play"></i>';
            } else if (this.state.currentStation) {
                this.audio.play();
                this.state.isPlaying = true;
                this.elements.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
        });

        this.elements.prevBtn.addEventListener('click', () => {
            if (!this.state.currentStation) return;
            const currentIndex = this.state.channels.findIndex(
                s => s.name === this.state.currentStation.name
            );
            const prevIndex = (currentIndex - 1 + this.state.channels.length) % this.state.channels.length;
            this.playStation(prevIndex);
        });

        this.elements.nextBtn.addEventListener('click', () => {
            if (!this.state.currentStation) return;
            const currentIndex = this.state.channels.findIndex(
                s => s.name === this.state.currentStation.name
            );
            const nextIndex = (currentIndex + 1) % this.state.channels.length;
            this.playStation(nextIndex);
        });

        this.audio.addEventListener('ended', () => {
            this.state.isPlaying = false;
            this.elements.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        });

        this.audio.addEventListener('error', () => {
            this.showAlert("Stream error occurred");
            this.stopPlayback();
        });
    }

    showAlert(message) {
        if (this.isTg && this.tg.showAlert) {
            this.tg.showAlert(message);
        } else {
            alert(message);
        }
    }
}

// Initialize app when loaded
document.addEventListener('DOMContentLoaded', () => {
    window.radioApp = new RadioApp();
});