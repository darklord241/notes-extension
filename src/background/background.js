import { MESSAGE_TYPES } from "../shared/constants.js";

const QUESTION_PAGE_PATTERN = /leetcode\.com\/problems\//;

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    if(details.frameId !== 0) return;
    if(QUESTION_PAGE_PATTERN.test(details.url)) {
        chrome.tabs.sendMessage(details.tabId, {
            type: MESSAGE_TYPES.QUESTION_CHANGED
        });
    }
});