import { getAllNotes } from "../storage/notes-store.js"; 
import { exportAllNotes } from "../storage/export.js";

const noteCount = document.getElementById("note-count");
const exportBtn = document.getElementById("export-btn");

let cachedNotes = [];

async function loadNoteCount() {
    try {
        cachedNotes = await getAllNotes();
        const count = cachedNotes.length;

        if(count === 0) {
            noteCount.textContent = "Go solve some questions first da";
            exportBtn.disabled = true;
        }
        else {
            noteCount.textContent = `${count} note${count === 1 ? "" : "s"} saved`;
            exportBtn.disabled = false;
        }
    }
    catch (err) {
        // console.error("failed to load notes", err);
        noteCount.textContent = "errorara";
        exportBtn.disabled = true;
    }
}

exportBtn.addEventListener("click", () => {
    if(cachedNotes.length === 0) return;

    // this boolean change prevents repeated button clicks from firing the exportAllNotes function while one is still running 
    exportBtn.disabled = true;
    exportBtn.textContent = "Exporting started";
    try {
        exportAllNotes(cachedNotes);
    } 
    catch (err) {
        console.error("failed to export notes", err);
    }
    finally {
        exportBtn.textContent = "Export all notes";
        exportBtn.disabled = false;
    }
});

loadNoteCount();