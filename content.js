const MARK_CLASS = "brou-kit-mark";

function clearMarks()
{
    document.querySelectorAll(`mark.${MARK_CLASS}`).forEach((mark) => {
        mark.parentNode.replaceChild(document.createTextNode(mark.textContent), mark);
        mark.parentNode.normalize();
    });
}

function highlight(query)
{
    clearMarks();
    if (!query)
        return 0;

    const pattern = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(pattern, "gi");
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;

    while ((node = walker.nextNode())) {
        if (node.parentElement.closest("script, style, noscript, textarea"))
            continue;
        if (regex.test(node.textContent))
            nodes.push(node);
        regex.lastIndex = 0;
    }

    let count = 0;

    for (const textNode of nodes) {
        const frag = document.createDocumentFragment();
        let last = 0;
        regex.lastIndex = 0;
        let match;

        while ((match = regex.exec(textNode.textContent)) !== null) {
            frag.appendChild(document.createTextNode(textNode.textContent.slice(last, match.index)));
            const mark = document.createElement("mark");
            mark.className = MARK_CLASS;
            mark.style.cssText =
                "background:#fbbf24;color:#1a1a2e;border-radius:2px;padding:0 1px;";
            mark.textContent = match[0];
            frag.appendChild(mark);
            last = match.index + match[0].length;
            count++;
        }

        frag.appendChild(document.createTextNode(textNode.textContent.slice(last)));
        textNode.parentNode.replaceChild(frag, textNode);
    }

    document.querySelector(`mark.${MARK_CLASS}`)?.scrollIntoView({ behavior : "smooth", block : "center" });

    return count;
}

chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
    if (msg.type === "SEARCH") {
        sendResponse({ count : highlight(msg.query) });
    } else if (msg.type === "CLEAR_SEARCH") {
        clearMarks();
    }
    return true;
});
