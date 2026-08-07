const QUESTION_URL_PATTERN = /\/problems\/([a-z0-9-]+)\/?/;

function getQuestionInfo() {
    const match = window.location.pathname.match(QUESTION_URL_PATTERN);
    if(!match) {
        return { isQuestionPage: false, id: null, title: null };
    }
    const id = match[1];
    const title = extractTitle();
    return {
        isQuestionPage: true,
        id,
        title
    };
}

function extractTitle() {
    const titleELement = document.querySelector('[data-cy="question-title"]') ?? document.querySelector("div.text-title-large");
    // below line is ternary operation  
    return titleELement ? titleELement.textContent.trim() : null;
}

export const leetcodeAdapter = {
    site: "leetcode",
    getQuestionInfo
};