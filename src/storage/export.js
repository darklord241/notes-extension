function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function slugToTitle(slug) {
    return slug
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function buildMd(records) {
    const grouped = {};
    for(const record of records) {
        if(!grouped[record.site]) grouped[record.site] = [];
        grouped[record.site].push(record);
    }

    const exportDate = formatDate(Date.now);
    let output = `# DSA Notes Export\n*Exported on : ${exportDate}* \n\n---\n\n`;
    const sites = Object.keys(grouped).sort();

    for(const site of sites) {
        output += `# ${slugToTitle(site)}\n\n`;

        const notes  = grouped[site].sort((a,b) => 
            a.questionId.localeCompare(b.questionId)
        );

        for(const note of notes) {
            const title = slugToTitle(note.questionId);
            const lastUpdatedAt = formatDate(note.updatedAt);
            output += `### ${title}\n`;
            output += `*Last Updated: ${lastUpdatedAtpdatedAt}\n\n`;
            output += `${note.content.trim()}\n\n`;
            output += `---`;
        }
    }
    return output;
}

function downloadMdFile(markdownText, filename="dsa-notes-export.md") {
    const blob = new Blob([markdownText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportAllNotes(allRecords) {
    const markdown = buildMd(allRecords);
    const datestamp = new Date().toISOString().split("T")[0];
    downloadMdFile(markdown, `dsa-notes-export-${datestamp}.md`);
}