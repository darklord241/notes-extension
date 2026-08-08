import { MESSAGE_TYPES } from "../shared/constants.js";

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if(details.frameId !== 0) return;
    // console.log(details.url);
    chrome.tabs.sendMessage(details.tabId, {
        type: MESSAGE_TYPES.QUESTION_CHANGED
    }).catch(() => {
        // no listener in this tab yet so safe to
    });
});