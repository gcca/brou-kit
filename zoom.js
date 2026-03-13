export function initZoom()
{
    const slider = document.getElementById("zoomSlider");
    const currentZoom = document.getElementById("currentZoom");
    const resetBtn = document.getElementById("resetBtn");
    const presets = document.querySelectorAll(".preset");
    const presetValues = Array.from(presets).map((btn) => parseInt(btn.dataset.zoom, 10));

    let activeTabId = null;

    chrome.tabs.query({ active : true, currentWindow : true }, ([ tab ]) => {
        if (!tab)
            return;
        activeTabId = tab.id;
        chrome.tabs.getZoom(tab.id, (factor) => setUI(Math.round(factor * 100)));
    });

    slider.addEventListener("input", () => setUI(parseInt(slider.value, 10)));
    slider.addEventListener("change", () => applyZoom(parseInt(slider.value, 10)));
    presets.forEach((btn, i) => {
        btn.addEventListener("click", () => {
            setUI(presetValues[i]);
            applyZoom(presetValues[i]);
        });
    });
    resetBtn.addEventListener("click", () => {
        setUI(100);
        applyZoom(100);
    });

    function setUI(percent)
    {
        const val = clamp(percent, 25, 500);
        slider.value = val;
        currentZoom.textContent = `${val}%`;
        presets.forEach((btn, i) => btn.classList.toggle("active", presetValues[i] === val));
    }

    function applyZoom(percent)
    {
        if (activeTabId === null)
            return;
        chrome.tabs.setZoom(activeTabId, percent / 100);
    }

    function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }
}
