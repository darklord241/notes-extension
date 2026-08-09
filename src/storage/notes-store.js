import Dexie from "dexie";

const db = new Dexie("DsaNotesDB");

db.version(1).stores({
    notes: "[site+questionId], site, questionId, updatedAt"
});

export async function getNote(site, questionId) {
    const record =  await db.notes.get({ site, questionId });
    return record ?? null;
}

export async function saveNote(site, questionId, noteData) {
    const existing = await getNote(site, questionId);
    const record = {
        site,
        questionId,
        content: noteData.content,
        updatedAt: Date.now(),
        createdAt: noteData.createdAt ?? existing?.createdAt ?? Date.now()
    };
    await db.notes.put(record);
    return record;    
}

export async function deleteNote(site, questionId) {
    await db.notes.delete([ site, questionId ]);
}

