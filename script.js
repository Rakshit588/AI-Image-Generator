const promptInput = document.getElementById('prompt');
const styleSelect = document.getElementById('style');
const resolutionSelect = document.getElementById('resolution');
const qualitySelect = document.getElementById('quality');
const countSelect = document.getElementById('count');
const generateBtn = document.getElementById('generateBtn');
const resultsDiv = document.getElementById('results');
const loadingSpinner = document.querySelector('.loading-spinner');
const btnText = document.querySelector('.btn-text');

const diceBtn = document.getElementById('diceBtn');

const randomPrompts = [
    "A futuristic cityscape at sunset, neon lights reflecting on wet streets",
    "A cute fantasy creature sitting on a mushroom, colorful forest",
    "Epic space battle with detailed starships and explosions",
    "A magical wizard casting a spell in a dark cave",
    "Portrait of a cyberpunk woman with glowing tattoos and holographic glasses",
    "A serene landscape of mountains and rivers under northern lights",
    "A cartoon robot cooking in a kitchen full of gadgets",
    "An abstract painting of swirling colors and shapes",
    "A majestic dragon flying over a medieval castle",
    "A vintage car parked under a street lamp in rainy night"
];

diceBtn.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * randomPrompts.length);
    const randomPrompt = randomPrompts[randomIndex];

    promptInput.value = randomPrompt;
});

let isGenerating = false;

generateBtn.addEventListener('click', generateImages);

promptInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) generateImages();
});

function generateImages() {
    const prompt = promptInput.value.trim();
    if (!prompt) {
        showStatusMessage('error', 'Please enter a description for your image.');
        return;
    }

    if (isGenerating) return;

    isGenerating = true;
    generateBtn.disabled = true;
    loadingSpinner.style.display = 'inline-block';
    btnText.textContent = 'Generating...';

    resultsDiv.innerHTML = '';
    showStatusMessage('info', 'Generating your images...');

    setTimeout(async () => {
        const count = parseInt(countSelect.value);
        const style = styleSelect.value;
        const quality = qualitySelect.value;

        await generateImageCards(prompt, count, style, quality);

        isGenerating = false;
        generateBtn.disabled = false;
        loadingSpinner.style.display = 'none';
        btnText.textContent = 'Generate Images';

        showStatusMessage('success', `Successfully generated ${count} image(s)!`);
    }, 500);
}

async function generateImageCards(prompt, count, style, quality) {
    const ACCESS_KEY = "zWf01JX6Zh7se3JqK5KgW1AmDRY_L7VOdJUqXMcepcc";
    const apiURL = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(prompt + " " + style + " " + quality)}&per_page=${count}&client_id=${ACCESS_KEY}`;

    let result;
    try {
        const res = await fetch(apiURL);
        result = await res.json();
    } catch (e) {
        showStatusMessage("error", "Failed to fetch images from Unsplash!");
        return;
    }

    if (!result.results || result.results.length === 0) {
        showStatusMessage("error", "No images found for this prompt!");
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'image-grid';

    for (let i = 0; i < result.results.length; i++) {
        const imgData = result.results[i];
        const imageUrl = imgData.urls.regular;

        const card = document.createElement('div');
        card.className = 'image-card';

        card.innerHTML = `
            <div class="image-container" style="position: relative;">
                <img src="${imageUrl}" 
                     alt="Generated"
                     style="width: 100%; height: 300px; object-fit: cover;"
                     onerror="this.parentElement.innerHTML='<div class=\\'image-placeholder\\'>Failed to load</div>'">
            </div>

            <div class="image-info">
                <div class="image-prompt">"${prompt}"</div>

                <div class="image-details">
                    <span>${style}</span>
                    <span>${quality}</span>
                </div>

                <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem;">
                    <button onclick="downloadImage('${imageUrl}', '${prompt.slice(0, 20)}')" 
                        style="flex: 1; padding: 0.5rem; background:#4a9eff; color:white; border:none; border-radius:4px;">
                        Download
                    </button>

                    <button onclick="openImageModal('${imageUrl}', '${prompt}')" 
                        style="flex: 1; padding: 0.5rem; background:#333; color:white; border:none; border-radius:4px;">
                        View Full
                    </button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    }

    resultsDiv.appendChild(grid);
}

function showStatusMessage(type, message) {
    const prev = document.querySelector('.status-message');
    if (prev) prev.remove();

    const msg = document.createElement('div');
    msg.className = `status-message status-${type}`;
    msg.textContent = message;

    resultsDiv.prepend(msg);

    if (type !== 'error') {
        setTimeout(() => msg.remove(), 5000);
    }
}

function downloadImage(url, name) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-image-${name.replace(/[^a-z0-9]/gi, '-')}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function openImageModal(url, prompt) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.9);
        display: flex; align-items:center; justify-content:center;
        z-index: 1000; cursor:pointer;
    `;

    modal.innerHTML = `
        <div style="max-width: 90%; max-height: 90%; position: relative;">
            <img src="${url}" style="max-width:100%; max-height:100%; border-radius:8px;">
            <button onclick="this.parentElement.parentElement.remove()" 
                style="position:absolute; top:-40px; right:0; background:#ff4444; color:white; 
                border:none; border-radius:50%; width:32px; height:32px;">×</button>
        </div>
    `;

    modal.onclick = (e) => {
        if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
}