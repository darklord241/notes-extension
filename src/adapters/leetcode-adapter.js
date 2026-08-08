const QUESTION_URL_PATTERN = /\/problems\/([a-z0-9-]+)\/?/;

function getQuestionInfo() {
    const match = window.location.pathname.match(QUESTION_URL_PATTERN);
    if(!match) {
        return { isQuestionPage: false, id: null };
    }
    const id = match[1];
    return {
        isQuestionPage: true,
        id
    };
}

export const leetcodeAdapter = {
    site: "leetcode",
    getQuestionInfo
};