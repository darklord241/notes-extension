import { leetcodeAdapter } from "../adapters/leetcode-adapter.js";
import { codeforcesAdapter } from "../adapters/codeforces-adapter.js";
import { getNote, saveNote } from "../storage/notes-store.js";
import { renderPanel, updatePanel, removePanel, togglePanel } from "./panel.js";
import { MESSAGE_TYPES } from "../shared/constants.js";

let currentQuestionId = null;
let isProcessing = false;

function getActiveAdapter() {
    const hostname = window.location.hostname;
    if(hostname.includes("codeforces.com")) return codeforcesAdapter;
    if(hostname.includes("leetcode.com")) return leetcodeAdapter;
    return null;
}

async function handleQuestionChange() {
    if(isProcessing) return;
    isProcessing = true;
    try {
        const adapter = getActiveAdapter();
        if(!adapter) return;

        const info = adapter.getQuestionInfo();
        if(!info.isQuestionPage) {
            currentQuestionId = null;
            removePanel();
            return;
        }
        // console.log("comparing", info.id, "vs", currentQuestionId);
        if(info.id === currentQuestionId) {
            return;
        }
        currentQuestionId = info.id;
        const existingNote = await getNote(adapter.site, info.id);
        renderPanel({
            site: adapter.site,
            questionId: info.id,
            note: existingNote,
            onSave: (questionId, noteData) => handleSave(adapter.site, questionId, noteData)
        });
    } finally {
        isProcessing = false;
    }
}

async function handleSave(site, questionId, noteData) {
    const savedRecord = await saveNote(site,questionId,noteData);
    updatePanel(savedRecord);
}

chrome.runtime.onMessage.addListener((message) => {
    // console.log("received",message);
    if(message.type === MESSAGE_TYPES.QUESTION_CHANGED) {
        handleQuestionChange().catch((err) => console.error("handleQuestionChange failed:",err));
    }
    else if(message.type === MESSAGE_TYPES.TOGGLE_PANEL) {
        // console.log("toggle received in content.js ")
        togglePanel();
    }
});

handleQuestionChange().catch((err) => console.error("handleQuestionChange failed:",err));