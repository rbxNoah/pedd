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

let songs = [];
let currentSongIndex = 0;
let isPlaying = false;
let lastGistUpdate = null;

// Buscar dados do Gist das músicas
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
        songs = [
            {
                title: "Música Exemplo",
                src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                cover: "https://raw.githubusercontent.com/rbxNoah/meu-site/main/8b1477859ffe84991872dec72db53e6d.jpg",
                artist: "p.ed__"
            }
        ];
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
}

// Tocar música
function playSong() {
    if (songs.length === 0) {
        alert('Nenhuma música disponível para reproduzir');
        return;
    }
    
    audioPlayer.play()
        .then(() => {
            isPlaying = true;
            playImg.src = "https://raw.githubusercontent.com/rbxNoah/meu-site/main/pause.png";
            albumCoverContainer.classList.add('playing');
        })
        .catch(err => {
            console.log('Erro ao reproduzir:', err);
            alert('Erro ao carregar a música. Verifique se o link está acessível.');
        });
}

// Pausar música
function pauseSong() {
    audioPlayer.pause();
    isPlaying = false;
    playImg.src = "https://raw.githubusercontent.com/rbxNoah/meu-site/main/play.png";
    albumCoverContainer.classList.remove('playing');
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

// Função para detectar e criar elementos de mídia
function createMediaElement(url) {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = "Imagem compartilhada";
        img.className = 'shared-media';
        return img;
    } else if (lowerUrl.match(/\.(mp4|webm|ogg|mov)$/)) {
        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.className = 'shared-media';
        return video;
    } else if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
        const videoId = lowerUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (videoId) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${videoId[1]}`;
            iframe.frameBorder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
            iframe.allowFullscreen = true;
            iframe.className = 'shared-media youtube-video';
            return iframe;
        }
    }
    
    return null;
}

// Processar conteúdo do Gist
function processGistContent(content) {
    const lines = content.split('\n');
    const textLines = [];
    const mediaUrls = [];
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    lines.forEach(line => {
        const urls = line.match(urlRegex);
        if (urls) {
            urls.forEach(url => {
                mediaUrls.push(url);
            });
            const textWithoutUrls = line.replace(urlRegex, '').trim();
            if (textWithoutUrls) {
                textLines.push(textWithoutUrls);
            }
        } else {
            textLines.push(line);
        }
    });
    
    return {
        text: textLines.join('\n'),
        mediaUrls: mediaUrls
    };
}

// Carregar conteúdo do Gist com cache busting
async function loadGistContent() {
    const gistContent = document.getElementById('gist-content');
    
    try {
        // Cache busting - adiciona timestamp para evitar cache
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
    
    const { text, mediaUrls } = processGistContent(content);
    
    // Adicionar texto
    if (text.trim()) {
        const textElement = document.createElement('div');
        textElement.className = 'gist-text';
        textElement.innerHTML = text.replace(/\n/g, '<br>');
        gistContent.appendChild(textElement);
    }
    
    // Adicionar mídia
    if (mediaUrls.length > 0) {
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'media-container';
        
        mediaUrls.forEach(url => {
            const mediaElement = createMediaElement(url);
            if (mediaElement) {
                mediaContainer.appendChild(mediaElement);
            }
        });
        
        gistContent.appendChild(mediaContainer);
    }
    
    // Conteúdo padrão se estiver vazio
    if (!text.trim() && mediaUrls.length === 0) {
        displayDefaultContent();
    }
}

// Exibir conteúdo padrão
function displayDefaultContent() {
    const gistContent = document.getElementById('gist-content');
    gistContent.innerHTML = `
        <div class="gist-text">
            <p>tentando não se MATAR
        </div>
    `;
}

// Verificar atualizações automaticamente a cada 30 segundos
function startAutoRefresh() {
    setInterval(() => {
        loadGistContent();
    }, 30000); // 30 segundos
}

// Inicializar
async function init() {
    songTitle.textContent = "Carregando músicas...";
    songArtist.textContent = "p.ed__";
    
    try {
        await loadSongsFromGist();
        setupEventListeners();
        loadSong(currentSongIndex);
        await loadGistContent();
        startAutoRefresh();
        
        console.log('Player inicializado com sucesso!');
        
    } catch (error) {
        console.error('Erro na inicialização:', error);
        songTitle.textContent = "Erro ao carregar músicas";
        songArtist.textContent = "p.ed__";
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

document.addEventListener('DOMContentLoaded', init);
