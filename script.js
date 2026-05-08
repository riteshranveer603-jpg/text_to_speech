document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Background Particles Animation ---
    const particlesContainer = document.getElementById('particles-background');
    const NUM_PARTICLES = 25;

    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Random properties for natural look
        const size = Math.random() * 8 + 3; // 3px to 11px
        const left = Math.random() * 100;
        const duration = Math.random() * 12 + 10; // 10s to 22s
        const delay = Math.random() * 8;

        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${left}%`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;

        particlesContainer.appendChild(particle);

        // Remove and recreate particle after it finishes to keep memory low
        setTimeout(() => {
            particle.remove();
            createParticle();
        }, (duration + delay) * 1000);
    }

    for (let i = 0; i < NUM_PARTICLES; i++) {
        createParticle();
    }

    // --- 2. UI Elements Selection ---
    const textInput = document.getElementById('text-input');
    const voiceSelect = document.getElementById('voice-select');
    const langSelect = document.getElementById('lang-select');
    const speedSlider = document.getElementById('speed-slider');
    const speedValue = document.getElementById('speed-value');

    const generateBtn = document.getElementById('generate-btn');
    const btnText = generateBtn.querySelector('.btn-text');
    const loader = generateBtn.querySelector('.loader');

    const playerSection = document.getElementById('player-section');
    const visualizer = document.querySelector('.visualizer');
    const stopBtn = document.getElementById('stop-btn');
    const downloadBtn = document.getElementById('download-btn');
    const playingStatus = document.getElementById('playing-status');

    // --- Media Recorder Variables ---
    let audioContext;
    let mediaRecorder;
    let audioChunks = [];
    let recordedBlob;

    // --- 2b. Populate Voices dynamically ---
    let voices = [];
    function populateVoiceList() {
        voices = window.speechSynthesis.getVoices();
        voiceSelect.innerHTML = '';
        voices.forEach((voice, i) => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.value = i;
            if (voice.default) {
                option.textContent += ' — DEFAULT';
            }
            voiceSelect.appendChild(option);
        });
    }

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }

    // --- 3. Speed Slider update ---
    speedSlider.addEventListener('input', (e) => {
        speedValue.textContent = `${parseFloat(e.target.value).toFixed(1)}x`;
    });

    // --- 4. Web Speech API Call ---
    generateBtn.addEventListener('click', () => {
        const textToSpeech = textInput.value.trim();

        if (!textToSpeech) {
            textInput.style.borderColor = '#ff4757';
            setTimeout(() => {
                textInput.style.borderColor = 'var(--card-border)';
            }, 1000);
            textInput.focus();
            return;
        }

        // --- Hack to allow downloading an MP3 using Google's free TTS endpoint ---
        // Using translate.googleapis.com with client=gtx avoids 404 errors and is more reliable.
        const url = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=${langSelect.value}&q=${encodeURIComponent(textToSpeech.substring(0, 200))}`;

        if (downloadBtn) {
            downloadBtn.onclick = () => {
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.download = `bol_ke_dikha_${langSelect.value}.mp3`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
            downloadBtn.disabled = false;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(textToSpeech);

        // Match the selected voice
        const selectedVoiceIndex = voiceSelect.value;
        if (voices[selectedVoiceIndex]) {
            utterance.voice = voices[selectedVoiceIndex];
        }

        // Set speed
        utterance.rate = parseFloat(speedSlider.value);

        // Hide loader and show player section immediately
        generateBtn.classList.remove('loading');
        generateBtn.disabled = false;
        btnText.textContent = 'Generate Audio';
        loader.classList.add('hidden');

        playerSection.classList.remove('hidden');
        visualizer.classList.add('active');
        playingStatus.textContent = 'Playing audio live...';

        utterance.onend = () => {
            visualizer.classList.remove('active');
            playingStatus.textContent = 'Finished playing. You can now download the MP3.';
        };

        window.speechSynthesis.speak(utterance);
    });

    stopBtn.addEventListener('click', () => {
        window.speechSynthesis.cancel();
        visualizer.classList.remove('active');
        playingStatus.textContent = 'Audio stopped.';
    });
});
