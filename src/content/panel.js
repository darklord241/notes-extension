import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
    // line breaks are properly converted to <br> 
    breaks: true,
    // github flavoured markdown 
    gfm: true,
});

let shadowHost = null;
let shadowRoot = null;
let panelElements = null;
let autosaveTimer = null;
let previewTimer = null;
let isCollapsed = true;

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

function makeDraggable(panelEl, headerEl) {
  let startX, startY, startLeft, startTop;

  function onMouseDown(e) {
    if (e.target.closest(".dsanotes-collapse-btn")) return;

    startX = e.clientX;
    startY = e.clientY;
    const rect = panelEl.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    panelEl.style.right = "auto";
    panelEl.style.left = `${startLeft}px`;
    panelEl.style.top = `${startTop}px`;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function onMouseMove(e) {
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    panelEl.style.left = `${startLeft + deltaX}px`;
    panelEl.style.top = `${startTop + deltaY}px`;
  }

  function onMouseUp() {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  }

  headerEl.addEventListener("mousedown", onMouseDown);
}

export function togglePanel() {
    if(!panelElements) return;
    const container = panelElements.container;
    const collapseBtn = container.querySelector(".dsanotes-collapse-btn");
    isCollapsed = !isCollapsed;
    container.classList.toggle("dsanotes-collapsed",isCollapsed);
    collapseBtn.textContent = isCollapsed ? "+":"-";
}

export function renderPanel({ site, questionId, title, note, onSave}) {
    // console.log("renderPanel called with", questionId, title);
    const root = ensureShadowHost();
    // console.log("root reference", root, "children count", root.children.length);
    const container = document.createElement("div");
    container.className = `dsanotes-panel${isCollapsed ? " dsanotes-collapsed" : ""}`;
    
    container.innerHTML = `
        <div class="dsanotes-header">
            <span class="dsanotes-title">${slugToTitle(questionId)}</span>
            <div class="dsanotes-header-controls">
                <span class="dsanotes-status"></span>
                <button class="dsanotes-collapse-btn">${isCollapsed ? "+":"-"}</button>
            </div>
        </div>
        <div class="dsanotes-body">
            <textarea class="dsanotes-textarea" placeholder="write your notes"></textarea>
            <div class="dsanotes-preview" style="display:none;"></div>
            <button class="dsanotes-save-btn">Save</button>
        </div>
    `;

    const textarea = container.querySelector(".dsanotes-textarea");
    textarea.value = note?.content ?? "";

    const existing = root.querySelector(".dsanotes-panel");
    // console.log("existing panel found?", !!existing);
    if(existing) existing.remove();
    root.appendChild(container);
    // console.log("new panel appended");

    if(autosaveTimer) {
        clearTimeout(autosaveTimer);
        autosaveTimer= null;
    }

    const previewDiv = container.querySelector(".dsanotes-preview");
    const header = container.querySelector(".dsanotes-header");
    const collapseBtn = container.querySelector(".dsanotes-collapse-btn");
    const saveBtn = container.querySelector(".dsanotes-save-btn");
    const status = container.querySelector(".dsanotes-status");

    makeDraggable(container, header);

    collapseBtn.addEventListener("click", togglePanel);

    let lastSavedContent = note?.content ?? "";

    function doSave() {
        status.textContent = "Saving ...";
        onSave( questionId, {
            content: textarea.value,
            createdAt: note?.createdAt
        });
        lastSavedContent = textarea.value;
    }

    function handleInput() {
        const isUpdated = textarea.value !== lastSavedContent;
        status.textContent = isUpdated ? "Unsaved" : "";

        if(autosaveTimer) clearTimeout(autosaveTimer);
        if(previewTimer) clearTimeout(previewTimer);

        if(isUpdated) {
            autosaveTimer = setTimeout(doSave, 1000);
        }
        previewTimer = setTimeout(showPreviewMode, 2000);
    }

    function renderMarkdownSafely(text) {
        return DOMPurify.sanitize(marked.parse(text));
    }

    function showEditMode() {
        textarea.style.display = 'block';
        previewDiv.style.display = 'none';
    }

    function showPreviewMode() {
        if(!textarea.value.trim()) return; // nothing to render then stay in edit mode 
        previewDiv.innerHTML = renderMarkdownSafely(textarea.value);
        textarea.style.display = "none";
        previewDiv.style.display = "block";
    }   

    textarea.addEventListener("input",() => {
        showEditMode();
        handleInput();
    });

    previewDiv.addEventListener("click", () => {
        showEditMode();
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    });

    saveBtn.addEventListener("click", () => {
        if(autosaveTimer) clearTimeout(autosaveTimer);
        doSave();
    });

    if(note?.content) {
        showPreviewMode();
    }

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
    if(autosaveTimer) {
        clearTimeout(autosaveTimer);
        autosaveTimer = null;
    }
}