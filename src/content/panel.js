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
    if (e.target.closest(".collapse-btn")) return;

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
    const collapseBtn = container.querySelector(".collapse-btn");
    isCollapsed = !isCollapsed;
    container.classList.toggle("dsanotes-collapsed",isCollapsed);
    collapseBtn.textContent = isCollapsed ? "+":"-";

    // if it is not collapsed which means it has been toggled open 
    if(!isCollapsed) {
        const textarea = panelElements.textarea;
        // if it is not an existing note then move cursor to the panel to start typing 
        if(!textarea.value.trim()) {
            // this is same utility as the click listener on previewDiv present in renderPanel function 
            // basically moves to edit mode and also move the cursor to the panel to start typing
            showEditMode();
        }
    }
}

function showPreviewMode() {
    if(!panelElements) return;
    const textarea = panelElements.textarea;
    const previewDiv = panelElements.container.querySelector(".preview");

    function renderMarkdownSafely(text) {
        return DOMPurify.sanitize(marked.parse(text));
    }   

    if(!textarea.value.trim()) {
        panelElements.status = "Ntg to preview";
        return; // nothing to render then stay in edit mode 
    }
    previewDiv.innerHTML = renderMarkdownSafely(textarea.value);
    textarea.style.display = 'none';
    previewDiv.style.display = 'block';
}

function showEditMode() {
    if(!panelElements) return;
    const textarea = panelElements.textarea;
    const previewDiv = panelElements.container.querySelector(".preview");

    function focusCursor() {
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }

    textarea.style.display = 'block';
    previewDiv.style.display = 'none';
    focusCursor();
}

export function toggleMode() {
    if(!panelElements) return;
    const textarea = panelElements.textarea;
    if(textarea.style.display === 'none') {
        showEditMode();
    }
    else {
        showPreviewMode();
    }
}

export function renderPanel({ site, questionId, title, note, onSave, onDelete}) {
    // console.log("renderPanel called with", questionId, title);
    const root = ensureShadowHost();
    // console.log("root reference", root, "children count", root.children.length);
    const container = document.createElement("div");
    container.className = `dsanotes-panel${isCollapsed ? " dsanotes-collapsed" : ""}`;
    
    container.innerHTML = `
        <div class="dsanotes-header">
            <span class="dsanotes-title">${slugToTitle(questionId)}</span>
            <div class="dsanotes-header-controls">
                <span class="status"></span>
                <button class="collapse-btn">${isCollapsed ? "+":"-"}</button>
            </div>
        </div>
        <div class="dsanotes-body">
            <textarea class="dsanotes-textarea" placeholder="write your notes"></textarea>
            <div class="preview" style="display:none;"></div>
            <div class="btns">
                <button class="save-btn">Save</button>
                <button class="dlt-btn">Delete</button>
            </div>
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
    if(previewTimer) {
        clearTimeout(previewTimer);
        previewTimer = null;
    }

    const previewDiv = container.querySelector(".preview");
    const header = container.querySelector(".dsanotes-header");
    const collapseBtn = container.querySelector(".collapse-btn");
    const saveBtn = container.querySelector(".save-btn");
    const status = container.querySelector(".status");
    const deleteBtn = container.querySelector(".dlt-btn");

    makeDraggable(container, header);

    function doSave() {
        status.textContent = "Saving ...";
        onSave( questionId, {
            content: textarea.value,
            createdAt: note?.createdAt
        });
        panelElements.lastSavedContent = textarea.value;
    }

    function delNote() {
        status.textContent = "Deleting ...";
        onDelete(questionId);
    }

    function handleInput() {
        const isUpdated = textarea.value !== panelElements.lastSavedContent;
        status.textContent = isUpdated ? "Unsaved" : "";

        if(autosaveTimer) clearTimeout(autosaveTimer);
        if(previewTimer) clearTimeout(previewTimer);

        if(isUpdated) {
            autosaveTimer = setTimeout(doSave, 1000);
        }
        previewTimer = setTimeout(showPreviewMode, 2000);
    }

    collapseBtn.addEventListener("click", togglePanel);

    textarea.addEventListener("input",() => {
        showEditMode();
        handleInput();
    });

    previewDiv.addEventListener("click",showEditMode);

    deleteBtn.addEventListener("click", delNote);

    saveBtn.addEventListener("click", () => {
        if(autosaveTimer) clearTimeout(autosaveTimer);
        doSave();
    });

    if(note?.content) {
        showPreviewMode();
    }

    panelElements = { container, textarea, status, lastSavedContent: note?.content ?? "" };
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
    if(previewTimer) {
        clearTimeout(previewTimer);
        previewTimer = null;
    }
}

export function clearPanel() {
    if(!panelElements) return;
    
    panelElements.textarea.value = "";
    panelElements.lastSavedContent = "";

    showEditMode();

    panelElements.status.textContent = "Deleted";
    setTimeout(() => {
        if(panelElements) panelElements.status.textContent = "";
    }, 1500); 
}