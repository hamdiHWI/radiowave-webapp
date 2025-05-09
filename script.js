class RadioApp {
    constructor() {
        this.audio = new Audio();
        this.stations = [
            {
                name: "Ulysse FM",
                url: "http://51.178.31.38:8000/stream",
                genre: "Variety"
            },
            {
                name: "Hits Europe",
                url: "https://stream2.superfm.lv:8000/ehr.aac",
                genre: "Pop"
            },
            {
                name: "Absolute Classic Hits",
                url: "http://94media.net/stations/jimfm/jim128.pls",
                genre: "Classic Rock"
            },
            {
                name: "Radio Paradise",
                url: "https://stream.radioparadise.com/flacm",
                genre: "Eclectic Mix"
            }
        ];
        
        this.currentStationIndex = -1;
        this.isPlaying = false;
        
        this.initElements();
        this.renderStations();
        this.setupEventListeners();
    }
    
    initElements() {
        this.elements = {
            playBtn: document.getElementById('playBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            nowPlaying: document.getElementById('nowPlaying'),
            stationList: document.getElementById('stationList'),
            loadingSpinner: document.getElementById('loadingSpinner')
        };
    }
    
    renderStations() {
        this.elements.loadingSpinner.style.display = 'none';
        this.elements.stationList.innerHTML = '';
        
        this.stations.forEach((station, index) => {
            const card = document.createElement('div');
            card.className = 'station-card';
            card.innerHTML = `
                <div class="station-name">${station.name}</div>
                <div class="station-genre">${station.genre}</div>
                <button class="play-btn" data-index="${index}">
                    <i class="fas fa-play"></i> Play
                </button>
            `;
            this.elements.stationList.appendChild(card);
        });
        
        document.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.playStation(index);
            });
        });
    }
    
    playStation(index) {
        const station = this.stations[index];
        this.currentStationIndex = index;
        
        this.audio.src = station.url;
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.elements.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                this.elements.nowPlaying.textContent = `Now Playing: ${station.name}`;
            })
            .catch(error => {
                console.error('Error playing station:', error);
                alert(`Could not play ${station.name}. Please try another station.`);
            });
    }
    
    setupEventListeners() {
        this.elements.playBtn.addEventListener('click', () => {
            if (this.currentStationIndex === -1 && this.stations.length > 0) {
                this.playStation(0);
                return;
            }
            
            if (this.isPlaying) {
                this.audio.pause();
                this.isPlaying = false;
                this.elements.playBtn.innerHTML = '<i class="fas fa-play"></i>';
            } else {
                this.audio.play();
                this.isPlaying = true;
                this.elements.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            }
        });
        
        this.elements.prevBtn.addEventListener('click', () => {
            if (this.currentStationIndex === -1) return;
            
            const newIndex = (this.currentStationIndex - 1 + this.stations.length) % this.stations.length;
            this.playStation(newIndex);
        });
        
        this.elements.nextBtn.addEventListener('click', () => {
            if (this.currentStationIndex === -1) return;
            
            const newIndex = (this.currentStationIndex + 1) % this.stations.length;
            this.playStation(newIndex);
        });
        
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.elements.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        });
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    const app = new RadioApp();
});