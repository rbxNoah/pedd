// ==================== PLAYER DE MÚSICA ====================

// Elementos principais
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const coverImg = document.getElementById('album-cover');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');

const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');

let songs = [];
let currentIndex = 0;
let isPlaying = false;
const audio = new Audio();

// Ícones locais
const playIcon = 'assets/imagens/play.png';
const pauseIcon = 'assets/imagens/pause.png';
const nextIcon = 'assets/imagens/next.png';
const prevIcon = 'assets/imagens/prev.png';

// ==================== CARREGAMENTO DAS MÚSICAS ====================
async function loadSongs() {
    try {
        const response = await fetch('assets/music/musica.json');
        const data = await response.json();
        songs = data.songs;
        
        if (songs && songs.length > 0) {
            loadSong(currentIndex);
            renderPlaylist();
        } else {
            console.warn('⚠️ Nenhuma música encontrada no JSON.');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar o arquivo musica.json:', error);
    }
}

function loadSong(index) {
    const song = songs[index];
    if (!song) return;
    
    songTitle.textContent = song.title || 'Desconhecida';
    songArtist.textContent = song.artist || 'Artista não identificado';
    coverImg.src = song.cover;
    audio.src = song.src.startsWith('http') ? song.src : `assets/music/${song.src}`;
}

// ==================== CONTROLES ====================
function playSong() {
    isPlaying = true;
    document.getElementById('play-img').src = pauseIcon;
    audio.play();
}

function pauseSong() {
    isPlaying = false;
    document.getElementById('play-img').src = playIcon;
    audio.pause();
}

function nextSong() {
    currentIndex = (currentIndex + 1) % songs.length;
    loadSong(currentIndex);
    playSong();
}

function prevSong() {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    loadSong(currentIndex);
    playSong();
}

// ==================== EVENTOS ====================
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalTimeEl.textContent = formatTime(audio.duration);
    }
});

progressBar.addEventListener('click', (e) => {
    const clickX = e.offsetX;
    const width = progressBar.clientWidth;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
});

playBtn.addEventListener('click', () => {
    isPlaying ? pauseSong() : playSong();
});

nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);
audio.addEventListener('ended', nextSong);

// ==================== RENDER PLAYLIST ====================
function renderPlaylist() {
    const container = document.getElementById('playlists-container');
    container.innerHTML = '';
    
    if (!songs || songs.length === 0) {
        container.innerHTML = '<div class="no-songs">Nenhuma música disponível.</div>';
        return;
    }
    
    const list = document.createElement('div');
    list.className = 'songs-list';
    
    songs.forEach((song, index) => {
        const item = document.createElement('div');
        item.className = 'song-item';
        if (index === currentIndex) item.classList.add('active');
        
        const img = document.createElement('img');
        img.className = 'song-cover';
        img.src = song.cover;
        img.alt = song.title;
        
        const info = document.createElement('div');
        info.className = 'song-info-small';
        
        const title = document.createElement('div');
        title.className = 'song-title-small';
        title.textContent = song.title;
        
        const artist = document.createElement('div');
        artist.className = 'song-artist-small';
        artist.textContent = song.artist;
        
        info.appendChild(title);
        info.appendChild(artist);
        item.appendChild(img);
        item.appendChild(info);
        
        item.addEventListener('click', () => {
            currentIndex = index;
            loadSong(currentIndex);
            playSong();
            renderPlaylist();
        });
        
        list.appendChild(item);
    });
    
    container.appendChild(list);
}

// ==================== FORMATADOR DE TEMPO ====================
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

// ==================== MENSAGEM DO GIST ====================
async function loadMessage() {
    try {
        const response = await fetch('assets/data/message.txt');
        const mensagem = await response.text();
        document.getElementById('gist-content').textContent = mensagem;
    } catch (error) {
        console.error('Erro ao carregar mensagem:', error);
        document.getElementById('gist-content').textContent = "Erro ao carregar mensagem.";
    }
}

// ==================== INICIALIZAÇÃO ====================
window.addEventListener('DOMContentLoaded', () => {
    loadSongs();
    loadMessage();
});