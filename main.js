// Player de Música
const audioPlayer = new Audio();
const playBtn = document.getElementById('play-btn');
const playImg = document.getElementById('play-img');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const progress = document.getElementById('progress');
const songTitle = document.getElementById('song-title');
const albumCover = document.getElementById('album-cover');
const songArtist = document.getElementById('song-artist');
const albumCoverContainer = document.querySelector('.album-cover');
const playlistsContainer = document.getElementById('playlists-container');

let songs = [];
let currentSongIndex = 0;
let isPlaying = false;

// Buscar dados do Gist das músicas - SÓ DO GIST
async function loadSongsFromGist() {
    try {
        const gistUrl = 'https://gist.githubusercontent.com/rbxNoah/4b88f02e40eaecbd696d1e41772861e6/raw';
        const response = await fetch(gistUrl);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar dados do Gist');
        }
        
        const songsData = await response.json();
        songs = songsData.songs || songsData || [];
        
        console.log('Músicas carregadas:', songs);
        
        if (songs.length === 0) {
            throw new Error('Nenhuma música encontrada no Gist');
        }
        
        return songs;
    } catch (error) {
        console.error('Erro ao carregar músicas:', error);
        // SEM MÚSICA DE FALLBACK - só retorna array vazio
        songs = [];
        return songs;
    }
}

// Carregar música
function loadSong(index) {
    if (songs.length === 0) {
        songTitle.textContent = "Nenhuma música disponível";
        songArtist.textContent = "p.ed__";
        return;
    }
    
    const song = songs[index];
    songTitle.textContent = song.title;
    songArtist.textContent = song.artist;
    albumCover.src = song.cover;
    audioPlayer.src = song.src;
    progress.style.width = "0%";
    
    albumCoverContainer.classList.remove('playing');
    updateActiveSongInList();
}

// Tocar música específica pelo índice
function playSongByIndex(index) {
    if (index >= 0 && index < songs.length) {
        currentSongIndex = index;
        loadSong(currentSongIndex);
        playSong();
    }
}

// Tocar música
function playSong() {
    if (songs.length === 0) {
        return;
    }
    
    audioPlayer.play()
        .then(() => {
            isPlaying = true;
            playImg.src = "https://raw.githubusercontent.com/rbxNoah/meu-site/main/pause.png";
            albumCoverContainer.classList.add('playing');
            updateActiveSongInList();
        })
        .catch(err => {
            console.log('Erro ao reproduzir:', err);
        });
}

// Pausar música
function pauseSong() {
    audioPlayer.pause();
    isPlaying = false;
    playImg.src = "https://raw.githubusercontent.com/rbxNoah/meu-site/main/play.png";
    albumCoverContainer.classList.remove('playing');
    updateActiveSongInList();
}

// Próxima música
function nextSong() {
    if (songs.length === 0) return;
    
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) playSong();
}

// Música anterior
function prevSong() {
    if (songs.length === 0) return;
    
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(currentSongIndex);
    if (isPlaying) playSong();
}

// Criar lista de músicas
function createSongsList(songs) {
    if (!playlistsContainer) return;
    
    if (songs.length === 0) {
        playlistsContainer.innerHTML = '<div class="no-songs">Nenhuma música encontrada no Gist</div>';
        return;
    }
    
    let html = `
        <div class="playlist-section">
            <h3 class="playlist-title">TODAS AS MÚSICAS</h3>
            <div class="songs-list">
    `;
    
    songs.forEach((song, index) => {
        const isActive = index === currentSongIndex && isPlaying;
        
        html += `
            <div class="song-item ${isActive ? 'active' : ''}" 
                 onclick="playSongByIndex(${index})">
                <img src="${song.cover}" alt="${song.title}" class="song-cover">
                <div class="song-info-small">
                    <div class="song-title-small ${isActive ? 'song-item-playing' : ''}">${song.title}</div>
                    <div class="song-artist-small">${song.artist}</div>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    playlistsContainer.innerHTML = html;
}

// Atualizar música ativa na lista
function updateActiveSongInList() {
    const songItems = document.querySelectorAll('.song-item');
    songItems.forEach((item, index) => {
        const isActive = index === currentSongIndex && isPlaying;
        item.classList.toggle('active', isActive);
        
        const titleElement = item.querySelector('.song-title-small');
        if (titleElement) {
            titleElement.classList.toggle('song-item-playing', isActive);
        }
    });
}

// Configurar event listeners
function setupEventListeners() {
    playBtn.addEventListener('click', () => {
        isPlaying ? pauseSong() : playSong();
    });

    nextBtn.addEventListener('click', nextSong);
    prevBtn.addEventListener('click', prevSong);

    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration) {
            const progressPercent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progress.style.width = `${progressPercent}%`;
        }
    });

    progressBar.addEventListener('click', (e) => {
        if (audioPlayer.duration) {
            const clickX = e.offsetX;
            const width = progressBar.clientWidth;
            const clickPercent = clickX / width;
            audioPlayer.currentTime = clickPercent * audioPlayer.duration;
        }
    });

    audioPlayer.addEventListener('ended', nextSong);
}

// Função para carregar conteúdo do Gist (texto)
async function loadGistContent() {
    const gistContent = document.getElementById('gist-content');
    
    try {
        const timestamp = `?t=${Date.now()}`;
        const gistUrl = `https://gist.githubusercontent.com/rbxNoah/87b6340c99ac6d7cf8a1af9919e0edca/raw${timestamp}`;
        
        const response = await fetch(gistUrl);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar Gist');
        }
        
        const content = await response.text();
        displayGistContent(content);
        
    } catch (error) {
        console.log('Erro ao carregar conteúdo do Gist:', error);
        displayDefaultContent();
    }
}

// Exibir conteúdo do Gist
function displayGistContent(content) {
    const gistContent = document.getElementById('gist-content');
    gistContent.innerHTML = '';
    
    if (content.trim()) {
        const textElement = document.createElement('div');
        textElement.className = 'gist-text';
        textElement.innerHTML = content.replace(/\n/g, '<br>');
        gistContent.appendChild(textElement);
    } else {
        displayDefaultContent();
    }
}

// Exibir conteúdo padrão
function displayDefaultContent() {
    const gistContent = document.getElementById('gist-content');
    gistContent.innerHTML = `
        <div class="gist-text">
            <p>tentando não se MATAR</p>
        </div>
    `;
}

// Verificar atualizações automaticamente
function startAutoRefresh() {
    setInterval(() => {
        loadGistContent();
    }, 30000);
}

// Inicializar
async function init() {
    // Só inicializa depois que o usuário aceitou o aviso
    const overlay = document.getElementById('blur-overlay');
    if (overlay.style.display !== 'none') {
        return;
    }
    
    songTitle.textContent = "Carregando músicas...";
    songArtist.textContent = "p.ed__";
    
    try {
        songs = await loadSongsFromGist();
        
        setupEventListeners();
        loadSong(currentSongIndex);
        createSongsList(songs);
        await loadGistContent();
        startAutoRefresh();
        
        console.log('Player inicializado com sucesso!');
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        songTitle.textContent = "Erro ao carregar músicas";
        songArtist.textContent = "p.ed__";
        if (playlistsContainer) {
            playlistsContainer.innerHTML = '<div class="no-songs">Erro ao carregar músicas do Gist</div>';
        }
    }
    
    // Preload das imagens
    const images = [
        "https://raw.githubusercontent.com/rbxNoah/meu-site/main/play.png",
        "https://raw.githubusercontent.com/rbxNoah/meu-site/main/pause.png", 
        "https://raw.githubusercontent.com/rbxNoah/meu-site/main/voltar%20m%C3%BAsica.png",
        "https://raw.githubusercontent.com/rbxNoah/meu-site/main/pula%20m%C3%BAsica.png"
    ];
    
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Torna a função global
window.playSongByIndex = playSongByIndex;

// Inicializa quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const overlay = document.getElementById('blur-overlay');
        if (overlay && overlay.style.display === 'none') {
            init();
        }
    }, 100);
});

// Inicializa quando o usuário aceitar o aviso
document.getElementById('continuar').addEventListener('click', function() {
    setTimeout(init, 700);
});
