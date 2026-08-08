import { leetcodeAdapter } from "../adapters/leetcode-adapter.js";
import { getNote, saveNote } from "../storage/notes-store.js";
import { renderPanel, updatePanel, removePanel } from "./panel.js";
import { MESSAGE_TYPES } from "../shared/constants.js";

let currentQuestionId = null;
let isProcessing = false;

async function handleQuestionChange() {
    if(isProcessing) return;
    isProcessing = true;
    try {
        const info = leetcodeAdapter.getQuestionInfo();
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
        const existingNote = await getNote(leetcodeAdapter.site, info.id);
        renderPanel({
            site: leetcodeAdapter.site,
            questionId: info.id,
            note: existingNote,
            onSave: handleSave
        });
    } finally {
        isProcessing = false;
    }
}

async function handleSave(questionId, noteData) {
    const savedRecord = await saveNote(leetcodeAdapter.site,questionId,noteData);
    updatePanel(savedRecord);
}

chrome.runtime.onMessage.addListener((message) => {
    // console.log("received",message);
    if(message.type == MESSAGE_TYPES.QUESTION_CHANGED) {
        handleQuestionChange().catch((err) => console.error("handleQuestionChange failed:",err));
    }
});

handleQuestionChange().catch((err) => console.error("handleQuestionChange failed:",err));