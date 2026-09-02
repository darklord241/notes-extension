import { MESSAGE_TYPES } from "../shared/constants.js";
import { getNote, saveNote, deleteNote } from "../storage/notes-store.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if(message.type === MESSAGE_TYPES.GET_NOTE) {
        getNote(message.site, message.questionId).then(sendResponse);
        return true;
    }
    if(message.type === MESSAGE_TYPES.SAVE_NOTE) {
        saveNote(message.site, message.questionId, message.noteData).then(sendResponse);
        return true; 
    }
    if(message.type === MESSAGE_TYPES.DELETE_NOTE) {
        deleteNote(message.site, message.questionId).then(sendResponse);
        return true;
    }
});

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if(details.frameId !== 0) return;
    // console.log(details.url);
    chrome.tabs.sendMessage(details.tabId, {
        type: MESSAGE_TYPES.QUESTION_CHANGED
    }).catch((err) => {
        console.debug("QUESTION_CHANGED not delivered:", err.message);
    });
});

chrome.commands.onCommand.addListener((command,tab) => {
    // console.log("command received : ",command);
    if(command === "toggle_panel") {
        // console.log("command within");
        chrome.tabs.sendMessage(tab.id, {
            type: MESSAGE_TYPES.TOGGLE_PANEL
        }).catch((err) => {
            console.debug("TOGGLE_PANEL not delivered:", err.message);
        });
    }
});