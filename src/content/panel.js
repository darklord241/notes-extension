let shadowHost = null;
let shadowRoot = null;
let panelElements = null;

function slugToTitle(slug) {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function ensureShadowHost() {
    if(shadowHost) return shadowRoot;
    shadowHost = document.createElement("div");
    shadowHost.id = "dsanotes-host";
    document.body.appendChild(shadowHost);
    shadowRoot = shadowHost.attachShadow({ mode: "open" });
    
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = chrome.runtime.getURL("src/content/panel.css");
    shadowRoot.appendChild(styleLink);
    
    return shadowRoot;
}

export function renderPanel({ site, questionId, title, note, onSave}) {
    // console.log("renderPanel called with", questionId, title);
    const root = ensureShadowHost();
    // console.log("root reference", root, "children count", root.children.length);
    const container = document.createElement("div");
    container.className = "dsanotes-panel";
    
    container.innerHTML = `
        <div class="dsanotes-header">
            <span class="dsanotes-title">${slugToTitle(questionId)}</span>
            <span class="dsanotes-status"></span>
        </div>
        <textarea class="dsanotes-textarea" placeholder="write your notes">${note?.content ?? ""}</textarea>
        <button class="dsanotes-save-btn">Save</button>
    `;

    const existing = root.querySelector(".dsanotes-panel");
    // console.log("existing panel found?", !!existing);
    if(existing) existing.remove();
    root.appendChild(container);
    // console.log("new panel appended");

    const textarea = container.querySelector(".dsanotes-textarea");
    const saveBtn = container.querySelector(".dsanotes-save-btn");
    const status = container.querySelector(".dsanotes-status");

    saveBtn.addEventListener("click", () => {
        onSave(questionId, {
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

export function removePanel() {
    if(!shadowHost) return;
    const existing = shadowRoot.querySelector(".dsanotes-panel");
    if(existing) existing.remove();
    panelElements = null;
}