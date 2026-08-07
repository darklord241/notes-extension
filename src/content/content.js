import { leetcodeAdapter } from "../adapters/leetcode-adapter.js";
import { getNote, saveNote } from "../storage/notes-store.js";
import { renderPanel, updatePanel } from "./panel.js";
import { MESSAGE_TYPES } from "../shared/constants.js";

let currentQuestionId = null;

async function handleQuestionChange() {
    const info = leetcodeAdapter.getQuestionInfo();
    if(!info.isQuestionPage) {
        currentQuestionId = null;
        removePanel();
        return;
    }
    currentQuestionId = info.id;
    const existingNote = await getNote(leetcodeAdapter.site, info.id);
    renderPanel({
        site: leetcodeAdapter.site,
        questionId: info.id,
        title: info.title,
        note: existingNote,
        onSave: handleSave
    });
}

async function handleSave(questionId, noteData) {
    const savedRecord = await saveNote(leetcodeAdapter.site,questionId,noteData);
    updatePanel(savedRecord);
}

chrome.runtime.onMessage.addListener((message) => {
    if(message.type == MESSAGE_TYPES.QUESTION_CHANGED) {
        handleQuestionChange();
    }
});

handleQuestionChange();