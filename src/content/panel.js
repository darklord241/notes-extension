let shadowHost = null;
let shadowRoot = null;
let panelElements = null;

function ensureShadowHost() {
    if(shadowHost) return shadowHost;
    shadowHost = document.createElement("div");
    shadowHost.id = "dsanotes-host";
    document.body.appendChild(shadowHost);
    shadowRoot = shadowHost.attachShadow({ mode: "open" });
    
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = chrome.runtime.getURL("panel.css");
    shadowRoot.appendChild(styleLink);
    
    return shadowRoot;
}

export function renderPanel({ site, questionId, title, note, onSave}) {
    const root = ensureShadowHost();
    const container = document.createElement("div");
    container.className = "dsanotes-panel";
    
    container.innerHTML = `
        <div class="dsanotes-header">
            <span class="dsanotes-title">${title ?? questionId}</span>
            <span class="dsanotes-status"></span>
        </div>
        <textarea classs="dsanotes-textarea" placeholder="write your notes">${note?.content ?? ""}</textarea>
        <button class="dsanotes-save-btn">Save</button>
    `;

    const existing = root.querySelector(".dsanotes-panel");
    if(existing) existing.remove();
    root.appendChild(container);
    
    const textarea = container.querySelector(".dsanotes-textarea");
    const saveBtn = container.querySelector(".dsanotes-save-btn");
    const status = container.querySelector(".dsanotes-status");

    saveBtn.addEventListener("click", () => {
        onSave(questionId, {
            title,
            content: textarea.value,
            createdAt: note?.createdAt
        });
    });

    panelElements = { container, textarea, status };
}

export function updatePanel(savedRecord) {
    if(!panelElements) return;
    panelElements.status.textContent = "Saved";
    setTimeout(() => {
        if(panelElements) panelElements.status.textContent = "";
    }, 1500);
}