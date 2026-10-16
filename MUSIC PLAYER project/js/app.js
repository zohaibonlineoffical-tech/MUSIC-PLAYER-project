const songs = [
    { id: 1, title: 'Midnight Dreams', artist: 'Alex Morgan', album: 'Nightfall', genre: 'Electronic / Chillwave', year: '2024', duration: '3:42', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', cover: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=700&q=80' },
    { id: 2, title: 'Lost In The City', artist: 'Daniel Rivers', album: 'Neon Lines', genre: 'Indie / Synthpop', year: '2023', duration: '4:15', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=700&q=80' },
    { id: 3, title: 'Ocean Waves', artist: 'Luna Sky', album: 'Tidal', genre: 'Ambient / Downtempo', year: '2024', duration: '3:56', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', cover: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=700&q=80' },
    { id: 4, title: 'Afterglow', artist: 'Mila Hart', album: 'Soft Focus', genre: 'R&B / Soul', year: '2022', duration: '3:28', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80' },
    { id: 5, title: 'Paper Planes', artist: 'The Sunday Club', album: 'Open Roads', genre: 'Alternative / Folk', year: '2024', duration: '4:02', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', cover: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=80' },
    { id: 6, title: 'Golden Hour', artist: 'Nora Wells', album: 'Solstice', genre: 'Pop / Dream', year: '2023', duration: '3:51', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', cover: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=700&q=80' },
    { id: 7, title: 'Rang-e-Raat', artist: 'Aarav Sen', album: 'Monsoon Letters', genre: 'Indian / Indie Folk', year: '2024', duration: '4:08', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', cover: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=700&q=80' },
    { id: 8, title: 'Mastag', artist: 'Gul Khan', album: 'Desert Echoes', genre: 'Balochi / Folk', year: '2024', duration: '5:02', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', cover: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=700&q=80' }
];

const $ = (selector) => document.querySelector(selector);
const audio = $('#audioPlayer');
const state = { currentIndex: Number(localStorage.getItem('musicflow-current') || 0), isPlaying: false, shuffle: false, repeat: 'off', autoplay: localStorage.getItem('musicflow-autoplay') !== 'false', theme: localStorage.getItem('musicflow-theme') || 'dark', favorites: JSON.parse(localStorage.getItem('musicflow-favorites') || '[]'), query: '', onlineResults: [], onlineCurrent: null, lastVolume: Number(localStorage.getItem('musicflow-volume') || .72) };
let toastTimer;
let searchTimer;

function currentSong() { return state.onlineCurrent || songs[state.currentIndex]; }

function formatTime(seconds) { if (!Number.isFinite(seconds)) return '0:00'; return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`; }

function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

function isFavorite(id) { return state.favorites.includes(id); }

function save(key, value) { localStorage.setItem(`musicflow-${key}`, value); }

function setPlayingUI() {
    $('#playButton').textContent = state.isPlaying ? 'Ⅱ' : '▶';
    $('#playButton').setAttribute('aria-label', state.isPlaying ? 'Pause current song' : 'Play current song');
    $('#miniPlay').textContent = state.isPlaying ? 'Ⅱ' : '▶';
    const artworkStage = $('#artworkStage');
    if (artworkStage) artworkStage.classList.toggle('is-playing', state.isPlaying);
    $('.artwork-stage').classList.toggle('is-playing', state.isPlaying);
    $('#mobilePlayer').classList.toggle('is-visible', state.isPlaying || window.innerWidth < 781);
}

function renderCurrentSong() {
    const song = currentSong();
    $('#heroTitle').textContent = song.title;
    $('#heroArtist').textContent = song.artist;
    $('#heroAlbum').textContent = `${song.album} · ${song.year}`;
    $('#heroGenre').textContent = song.genre;
    $('#heroTrackNumber').textContent = song.isOnline ? 'Online preview' : `${String(song.id).padStart(2, '0')} of ${String(songs.length).padStart(2, '0')}`;
    $('#heroArtwork').src = song.cover;
    $('#heroArtwork').alt = `Album artwork for ${song.title}`;
    $('#miniArtwork').src = song.cover;
    $('#miniArtwork').alt = `${song.title} artwork`;
    $('#miniTitle').textContent = song.title;
    $('#miniArtist').textContent = song.artist;
    $('#heroFavorite').textContent = isFavorite(song.id) ? '♥' : '♡';
    $('#heroFavorite').classList.toggle('is-favorite', isFavorite(song.id));
    audio.src = song.src;
    audio.load();
    $('#totalTime').textContent = song.duration;
    if (!state.onlineCurrent) updateSearch(state.query);
    if (!state.onlineCurrent) save('current', state.currentIndex);
    setPlayingUI();
}

function renderCollection() { $('#collectionGrid').innerHTML = songs.slice(0, 4).map((song) => `<article class="collection-card" data-song-id="${song.id}"><img loading="lazy" src="${song.cover}" alt="${song.title} album artwork"><h3>${song.title}</h3><p>${song.artist}</p></article>`).join(''); }

function renderQueue(list = songs) {
    const queue = $('#queueList');
    if (!list.length) { queue.innerHTML = `<div class="empty-state"><strong>No songs found</strong><span>Try another title, artist, or album.</span></div>`; return; }
    queue.innerHTML = list.map((song, position) => `<article class="queue-item ${song.isOnline ? 'is-online' : ''} ${song.id === currentSong().id ? 'is-current' : ''}" ${song.isOnline ? `data-online-id="${song.id}"` : `data-song-id="${song.id}"`}><span class="queue-number">${String(position + 1).padStart(2, '0')}</span><img class="queue-thumb" loading="lazy" src="${song.cover}" alt=""><div class="track-copy"><strong>${song.title}${song.isOnline ? '<span class="online-label">ONLINE</span>' : ''}</strong><span>${song.artist}</span></div><span class="queue-album">${song.album}</span><button class="heart-button ${isFavorite(song.id) ? 'is-favorite' : ''}" data-favorite-id="${song.id}" aria-label="${isFavorite(song.id) ? 'Remove from' : 'Add to'} favorites">${isFavorite(song.id) ? '♥' : '♡'}</button><span class="queue-duration">${song.duration}</span></article>`).join('');
}

function toggleFavorite(id) {
    if (isFavorite(id)) {
        state.favorites = state.favorites.filter((favoriteId) => favoriteId !== id);
        showToast('Removed from favorites');
    } else {
        state.favorites.push(id);
        showToast('Added to favorites');
    }
    save('favorites', JSON.stringify(state.favorites));
    $('#favoriteCount').textContent = state.favorites.length;
    renderCurrentSong();
}

function selectSong(id, shouldPlay = true) {
    const index = songs.findIndex((song) => song.id === id);
    if (index < 0) return;
    state.onlineCurrent = null;
    state.currentIndex = index;
    renderCurrentSong();
    if (shouldPlay) playSong();
}

function selectOnlineSong(id) {
    const song = state.onlineResults.find((result) => result.id === id);
    if (!song) return;
    state.onlineCurrent = song;
    renderCurrentSong();
    playSong();
}

function playSong() {
    audio.play().then(() => {
        state.isPlaying = true;
        setPlayingUI();
        showToast(`Playing ${currentSong().title}`);
    }).catch(() => {
        state.isPlaying = false;
        setPlayingUI();
        showToast('Unable to load this track');
    });
}

function pauseSong() {
    audio.pause();
    state.isPlaying = false;
    setPlayingUI();
}

function nextSong() {
    if (state.onlineCurrent) state.onlineCurrent = null;
    if (state.shuffle) {
        let next = state.currentIndex;
        while (songs.length > 1 && next === state.currentIndex) next = Math.floor(Math.random() * songs.length);
        state.currentIndex = next;
    } else state.currentIndex = (state.currentIndex + 1) % songs.length;
    renderCurrentSong();
    if (state.isPlaying || state.autoplay) playSong();
}

function previousSong() {
    if (state.onlineCurrent) state.onlineCurrent = null;
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    state.currentIndex = (state.currentIndex - 1 + songs.length) % songs.length;
    renderCurrentSong();
    if (state.isPlaying) playSong();
}

function togglePlay() { state.isPlaying ? pauseSong() : playSong(); }

function updateSearch(query) {
    state.query = query.trim().toLowerCase();
    const results = songs.filter((song) => [song.title, song.artist, song.album, song.genre].some((value) => value.toLowerCase().includes(state.query)));
    $('#queueTitle').textContent = state.query ? `Search results` : 'Recently played';
    renderQueue(state.query ? results : songs);
}

function updateRegionBanner(country, language = 'ALL') {
    const labels = { GLOBAL: 'Global Music', PK: 'Pakistan Music', IN: 'India Music', US: 'United States Music', GB: 'United Kingdom Music', TR: 'Turkey Music', KR: 'Korea Music', AR: 'Arabic Music', OTHER: 'Global Music' };
    const flag = country === 'PK' ? '🇵🇰' : country === 'IN' ? '🇮🇳' : country === 'GB' ? '🇬🇧' : country === 'US' ? '🇺🇸' : '🌍';
    const languageSuffix = language !== 'ALL' ? ` · ${language}` : '';
    $('#regionBanner').innerHTML = `<span>${flag}</span><strong>${labels[country] || 'Global Music'}${languageSuffix}</strong>`;
}

function inferredCountryForQuery(query) {
    const countryHints = [
        { code: 'PK', terms: ['pakistan', 'pakistani', 'coke studio pakistan', 'urdu', 'sindhi', 'pashto', 'saraiki', 'balochi', 'punjabi pakistani'] },
        { code: 'IN', terms: ['india', 'indian', 'hindi', 'bollywood', 'tamil', 'telugu', 'punjabi'] },
        { code: 'GB', terms: ['uk', 'british', 'english'] },
        { code: 'TR', terms: ['turkey', 'turkish'] },
        { code: 'JP', terms: ['japan', 'japanese', 'j-pop'] },
        { code: 'KR', terms: ['korea', 'korean', 'k-pop'] },
        { code: 'NG', terms: ['nigeria', 'nigerian', 'afrobeats'] },
        { code: 'BR', terms: ['brazil', 'brazilian', 'portuguese'] }
    ];
    const match = countryHints.find((hint) => hint.terms.some((term) => query.includes(term)));
    return match ? match.code : null;
}

async function searchOnline(query) {
    state.query = query.trim().toLowerCase();
    if (state.query.length < 2) {
        state.onlineResults = [];
        state.onlineCurrent = null;
        updateSearch(state.query);
        return;
    }

    $('#queueTitle').textContent = 'Searching online...';
    $('#queueList').innerHTML = '<div class="empty-state"><strong>Searching the global catalog</strong><span>Finding songs and previews...</span></div>';
    try {
        const selectedCountry = $('#countrySelect').value;
        const inferredCountry = selectedCountry === 'GLOBAL' ? inferredCountryForQuery(state.query) : null;
        const displayCountry = inferredCountry || selectedCountry;
        const country = selectedCountry === 'GLOBAL' ? (inferredCountry || 'US') : ['PK', 'IN', 'US', 'GB', 'TR', 'KR'].includes(selectedCountry) ? selectedCountry : 'US';
        const language = $('#languageSelect').value;
        const regionTerm = selectedCountry === 'AR' ? ' Arabic' : '';
        const searchTerm = `${state.query}${regionTerm}${language !== 'ALL' ? ` ${language}` : ''}`;
        updateRegionBanner(displayCountry, language);
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&country=${country}&media=music&entity=song&limit=24`);
        if (!response.ok) throw new Error('Online search failed');
        const data = await response.json();
        state.onlineResults = data.results.filter((result) => result.previewUrl).map((result) => ({
            id: result.trackId,
            title: result.trackName,
            artist: result.artistName,
            album: result.collectionName || 'Online catalog',
            genre: result.primaryGenreName || 'Music',
            year: result.releaseDate ? result.releaseDate.slice(0, 4) : '',
            duration: formatTime(result.trackTimeMillis / 1000),
            src: result.previewUrl,
            cover: (result.artworkUrl100 || '').replace('100x100', '500x500'),
            country,
            language: result.language || null,
            isOnline: true
        }));
        $('#queueTitle').textContent = `Online results · ${$('#countrySelect').selectedOptions[0].textContent}`;
        renderQueue(state.onlineResults);
        if (!state.onlineResults.length) $('#queueList').innerHTML = '<div class="empty-state"><strong>No online songs found</strong><span>Try another search or country.</span></div>';
    } catch (error) {
        state.onlineResults = [];
        $('#queueTitle').textContent = 'Online search unavailable';
        $('#queueList').innerHTML = '<div class="empty-state"><strong>Could not reach the music catalog</strong><span>Check your connection and try again.</span></div>';
        showToast('Online search is unavailable');
    }
}

function showView(view) {
    $('#searchInput').value = '';
    $('#clearSearch').parentElement.classList.remove('has-value');
    state.query = '';
    state.onlineResults = [];
    state.onlineCurrent = null;
    document.querySelectorAll('.nav-item[data-view], .playlist-link').forEach((item) => item.classList.remove('is-active'));
    const activeItem = document.querySelector(`[data-view="${view}"]`) || document.querySelector(`[data-playlist="${view}"]`);
    if (activeItem) activeItem.classList.add('is-active');

    if (view === 'favorites') {
        const favorites = songs.filter((song) => isFavorite(song.id));
        $('#queueTitle').textContent = 'Your favorites';
        if (favorites.length) renderQueue(favorites);
        else $('#queueList').innerHTML = '<div class="empty-state"><strong>Your favorites are empty</strong><span>Songs you love will appear here.</span></div>';
    } else if (view === 'late-night') {
        $('#queueTitle').textContent = 'Late night drive';
        renderQueue(songs.filter((song) => [1, 2, 3, 6].includes(song.id)));
    } else if (view === 'focus') {
        $('#queueTitle').textContent = 'Focus mode';
        renderQueue(songs.filter((song) => [4, 5, 7].includes(song.id)));
    } else if (view === 'sunday') {
        $('#queueTitle').textContent = 'Sunday morning';
        renderQueue(songs.filter((song) => [3, 6, 8].includes(song.id)));
    } else {
        $('#queueTitle').textContent = view === 'discover' ? 'Discover tracks' : view === 'library' ? 'Your library' : 'Recently played';
        renderQueue(songs);
    }
    $('#sidebar').classList.remove('is-open');
}

function applyTheme() {
    document.documentElement.dataset.theme = state.theme === 'light' ? 'light' : 'dark';
    $('#themeToggle').textContent = state.theme === 'light' ? '☾' : '☼';
}

function updateAutoplay() {
    $('#autoplayToggle').innerHTML = `<span class="status-dot"></span> Autoplay <strong>${state.autoplay ? 'On' : 'Off'}</strong>`;
    save('autoplay', state.autoplay);
}

$('#playButton').addEventListener('click', togglePlay);
$('#miniPlay').addEventListener('click', togglePlay);
$('#nextButton').addEventListener('click', nextSong);
$('#miniNext').addEventListener('click', nextSong);
$('#previousButton').addEventListener('click', previousSong);
$('#shuffleButton').addEventListener('click', () => {
    state.shuffle = !state.shuffle;
    $('#shuffleButton').classList.toggle('is-active', state.shuffle);
    showToast(state.shuffle ? 'Shuffle enabled' : 'Shuffle disabled');
});
$('#repeatButton').addEventListener('click', () => {
    state.repeat = state.repeat === 'off' ? 'all' : state.repeat === 'all' ? 'one' : 'off';
    $('#repeatButton').classList.toggle('is-active', state.repeat !== 'off');
    showToast(`Repeat ${state.repeat === 'off' ? 'off' : state.repeat === 'one' ? 'current song' : 'playlist'}`);
});
$('#autoplayToggle').addEventListener('click', () => {
    state.autoplay = !state.autoplay;
    updateAutoplay();
    showToast(`Autoplay ${state.autoplay ? 'enabled' : 'disabled'}`);
});
$('#heroFavorite').addEventListener('click', () => toggleFavorite(currentSong().id));
$('#progressBar').addEventListener('input', (event) => { if (audio.duration) audio.currentTime = (event.target.value / 100) * audio.duration; });
$('#volumeBar').addEventListener('input', (event) => {
    audio.volume = event.target.value;
    state.lastVolume = Number(event.target.value);
    $('#volumeValue').textContent = Math.round(state.lastVolume * 100);
    save('volume', state.lastVolume);
});
$('#muteButton').addEventListener('click', () => {
    audio.muted = !audio.muted;
    $('#muteButton').textContent = audio.muted ? '◌' : '◖';
});
$('#themeToggle').addEventListener('click', () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    save('theme', state.theme);
    applyTheme();
});
$('#searchInput').addEventListener('input', (event) => {
    $('#clearSearch').parentElement.classList.toggle('has-value', Boolean(event.target.value));
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => searchOnline(event.target.value), 350);
});
$('#clearSearch').addEventListener('click', () => {
    $('#searchInput').value = '';
    $('#clearSearch').parentElement.classList.remove('has-value');
    updateSearch('');
    updateRegionBanner($('#countrySelect').value, $('#languageSelect').value);
});
$('#countrySelect').addEventListener('change', () => {
    if ($('#searchInput').value.trim()) searchOnline($('#searchInput').value);
    else updateRegionBanner($('#countrySelect').value, $('#languageSelect').value);
});
$('#languageSelect').addEventListener('change', () => {
    if ($('#searchInput').value.trim()) searchOnline($('#searchInput').value);
    else updateRegionBanner($('#countrySelect').value, $('#languageSelect').value);
});
$('#menuButton').addEventListener('click', () => $('#sidebar').classList.toggle('is-open'));
document.addEventListener('click', (event) => {
    const favorite = event.target.closest('[data-favorite-id]');
    if (favorite) {
        event.stopPropagation();
        toggleFavorite(Number(favorite.dataset.favoriteId));
        return;
    }
    const item = event.target.closest('[data-song-id]');
    if (item) selectSong(Number(item.dataset.songId));
    const onlineItem = event.target.closest('[data-online-id]');
    if (onlineItem) selectOnlineSong(Number(onlineItem.dataset.onlineId));
    const view = event.target.closest('[data-view]');
    if (view) showView(view.dataset.view);
    const playlist = event.target.closest('[data-playlist]');
    if (playlist) showView(playlist.dataset.playlist);
});
$('#installHint').addEventListener('click', () => showToast('Desktop app coming soon'));
$('.profile-card').addEventListener('click', () => showToast('Profile menu coming soon'));

audio.addEventListener('timeupdate', () => {
    $('#currentTime').textContent = formatTime(audio.currentTime);
    $('#progressBar').value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
});
audio.addEventListener('loadedmetadata', () => { if (Number.isFinite(audio.duration)) $('#totalTime').textContent = formatTime(audio.duration); });
audio.addEventListener('play', () => {
    state.isPlaying = true;
    setPlayingUI();
});
audio.addEventListener('pause', () => {
    state.isPlaying = false;
    setPlayingUI();
});
audio.addEventListener('ended', () => {
    if (state.repeat === 'one') {
        audio.currentTime = 0;
        playSong();
    } else if (state.autoplay || state.repeat === 'all') nextSong();
    else {
        state.isPlaying = false;
        setPlayingUI();
    }
});
audio.addEventListener('error', () => showToast('Unable to load this track'));
document.addEventListener('keydown', (event) => {
    if (event.target.matches('input')) return;
    if (event.code === 'Space') {
        event.preventDefault();
        togglePlay();
    }
    if (event.key === 'ArrowRight') nextSong();
    if (event.key === 'ArrowLeft') previousSong();
    if (event.key.toLowerCase() === 'm') {
        audio.muted = !audio.muted;
        $('#muteButton').textContent = audio.muted ? '◌' : '◖';
    }
});

state.favorites.forEach((id) => { if (!songs.some((song) => song.id === id)) state.favorites = state.favorites.filter((favoriteId) => favoriteId !== id); });
audio.volume = state.lastVolume;
$('#volumeBar').value = state.lastVolume;
$('#volumeValue').textContent = Math.round(state.lastVolume * 100);
$('#favoriteCount').textContent = state.favorites.length;
applyTheme();
updateAutoplay();
renderCurrentSong();
renderCollection();
updateRegionBanner($('#countrySelect').value, $('#languageSelect').value);