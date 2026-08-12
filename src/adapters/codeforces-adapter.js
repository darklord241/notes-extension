const QUESTION_URL_PATTERN = /\/problemset\/problem\/(\d+)\/([A-Za-z0-9]+)\/?/;

function getQuestionInfo() {
    const match = window.location.pathname.match(QUESTION_URL_PATTERN);
    if(!match) {
        return { isQuestionPage: false, id: null };
    }
    
    const contestId = match[1];
    const index = match[2];
    const id = `${contestId}-${index}`;

    return { isQuestionPage: true, id: id};
}

export const codeforcesAdapter = {
    site: "codeforces",
    getQuestionInfo
};