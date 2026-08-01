import { STORAGE_KEY_PREFIX } from "../shared/constants.js";

function buildKey(site, questionId) {
    return '${STORAGE_KEY_PREFIX}:${site}:${questionId}';
}

export async function getNote(site, questionId) {
    const key = buildKey(site, questionId);
    const result = await chrome.storage.local.get(key);
    return result[key] ?? null;
}

export async function saveNote(site, questionId, noteData) {
    const key = buildKey(site, questionId);
    const record = {
        site,
        questionId,
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags ?? [],
        updatedAt: Date.now(),
        createdAt: noteData.createdAt ?? Date.now()
    };
    await chrome.storage.local.set({ [key]: record });
    return record;
}

export async function deleteNote(site, questionId) {
    const key = buildKey(site, questionId);
    await chrome.storage.local.remove(key);
}

