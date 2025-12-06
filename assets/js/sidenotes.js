let postClass = "gh-content";
let postSelector = ".gh-content";
let notesWrapperSelector = ".notes-wrapper";
let footnoteRefSelector = ".footnote-ref";

function debounce(func, wait, immediate) {
    var timeout;

    return function () {
        var context = this,
            args = arguments;

        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        var callNow = immediate && !timeout;

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
}

function showSidenotes() {
    const el = document.querySelector(postSelector);
    if (el) el.classList.remove("hide-sidenotes");
}

function hideSidenotes() {
    const el = document.querySelector(postSelector);
    if (el) el.classList.add("hide-sidenotes");
}

function showEndnotes() {
    const el = document.querySelector(postSelector);
    if (el) el.classList.remove("hide-endnotes");
}

function hideEndnotes() {
    const el = document.querySelector(postSelector);
    if (el) el.classList.add("hide-endnotes");
}

function insertSidenotes() {
    const postContent = document.querySelector(postSelector);
    if (!postContent) return;

    for (const child of postContent.children) {
        if (child.classList.contains(notesWrapperSelector.slice(1))) {
            continue;
        }

        // Prevent duplicates: check if the next element is already a notes wrapper
        if (child.nextElementSibling && child.nextElementSibling.classList.contains(notesWrapperSelector.slice(1))) {
            continue;
        }

        const anchors = child.querySelectorAll(footnoteRefSelector);

        if (anchors.length) {
            const sidenoteContainer = document.createElement("div");
            sidenoteContainer.setAttribute("class", notesWrapperSelector.slice(1));

            for (let anchor of anchors) {
                const aref = anchor.firstChild;
                const id = aref.id;
                // Ghost IDs are usually fnref1, fn1.
                // The anchor href points to #fn1. The anchor id is fnref1.
                // The content id is fn1.
                const contentId = aref.getAttribute("href").replace("#", "");

                const content = document.getElementById(contentId);
                if (!content) continue;

                const sidenoteWrapper = document.createElement("aside");

                sidenoteWrapper.setAttribute("id", "sidenote-" + contentId);
                sidenoteWrapper.setAttribute("class", "note");
                sidenoteWrapper.setAttribute("role", "note");
                sidenoteWrapper.setAttribute("data-anchor-id", aref.id); // Use the anchor's ID to find position

                // Get content from the paragraph inside the list item
                // Ghost structure: <li id="fn1"><p>Content <a href="#fnref1">↩</a></p></li>
                // We want the innerHTML of the p, minus the back link.

                let noteContentHTML = content.innerHTML;

                sidenoteWrapper.innerHTML = noteContentHTML;

                // Remove "jump back to text" link
                const links = sidenoteWrapper.querySelectorAll("a.footnote-backref");
                for (const link of links) {
                    link.remove();
                }

                sidenoteWrapper.insertAdjacentHTML("afterbegin", `<div class='note-identifier'>${anchor.textContent}</div>`);
                sidenoteContainer.insertAdjacentElement("beforeend", sidenoteWrapper);
            }

            child.insertAdjacentElement("afterend", sidenoteContainer);
        }
    }
}

function positionSidenotes() {
    const sidenotes = document.querySelectorAll("aside.note");
    const postContent = document.querySelector(postSelector);
    if (!postContent) return;

    for (let i = 0; i < sidenotes.length; i++) {
        const sidenote = sidenotes[i];

        const anchorId = sidenote.getAttribute("data-anchor-id");
        // We need to find the anchor in the text.
        const anchor = document.getElementById(anchorId);
        if (!anchor) continue;

        // Calculate position relative to the post content container

        const container = sidenote.parentElement; // .notes-wrapper
        const containerRect = container.getBoundingClientRect();
        const anchorRect = anchor.getBoundingClientRect();

        // Calculate offset relative to the container
        // We want the top of the sidenote to align with the top of the anchor (plus some adjustment)
        let topOffset = anchorRect.top - containerRect.top;

        // Adjust for overlap
        if (i > 0) {
            const prevSidenote = sidenotes[i - 1];
            // Check if they are in the same container or overlapping visually?
            // If they are in different containers (different paragraphs), we need to check global overlap.
            // But `getBoundingClientRect` is global viewport.

            const prevRect = prevSidenote.getBoundingClientRect();
            const currentRect = sidenote.getBoundingClientRect(); // current position (might be wrong before setting top)

            // If we set topOffset, the new top will be containerRect.top + topOffset.
            // We want (containerRect.top + topOffset) > prevRect.bottom + margin.

            const desiredTop = containerRect.top + topOffset;
            const minTop = prevRect.bottom + 10; // 10px margin

            if (desiredTop < minTop) {
                topOffset += minTop - desiredTop;
            }
        }

        sidenote.style.top = `${topOffset}px`;
    }
}

function insertAndPositionSidenotes({ showFootnotes }) {
    const mediaQuery = window.matchMedia("(min-width: 65rem)");

    if (mediaQuery.matches) {
        insertSidenotes();
        positionSidenotes();
        hideEndnotes();
        setTimeout(() => positionSidenotes(), 200); // Re-calc after layout
    }
}

function onResize() {
    const sidenotesInDom = Boolean(document.querySelector(notesWrapperSelector));
    const mediaQuery = window.matchMedia("(min-width: 65rem)");

    if (mediaQuery.matches) {
        if (!sidenotesInDom) {
            insertSidenotes();
        }

        showSidenotes();
        hideEndnotes();
        positionSidenotes();
    } else {
        if (sidenotesInDom) {
            hideSidenotes();
            showEndnotes();
        }
    }
}

function onAnchorClick(evt) {
    const mediaQuery = window.matchMedia("(min-width: 65rem)");

    dehilightNotes();

    if (mediaQuery.matches) {
        // Find the sidenote corresponding to this anchor
        // Anchor href is #fn1. Sidenote id is sidenote-fn1.
        const href = evt.currentTarget.getAttribute("href");
        const contentId = href.replace("#", "");
        const sidenote = document.getElementById("sidenote-" + contentId);

        if (sidenote) {
            evt.preventDefault();
            evt.stopPropagation();
            sidenote.classList.add("active-sidenote");

            sidenote.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }
}

function dehilightNotes() {
    const highlighted = document.querySelectorAll(".active-sidenote");
    for (let highlight of highlighted) {
        highlight.classList.remove("active-sidenote");
    }
}

function initSidenotes({ showFootnotes = true } = {}) {
    // Check if we are on a post page
    if (document.querySelector(postSelector)) {
        if (showFootnotes) {
            window.addEventListener("resize", debounce(onResize, 100));

            const anchors = document.querySelectorAll(footnoteRefSelector + " a");

            for (const anchor of anchors) {
                anchor.addEventListener("click", onAnchorClick);
            }

            document.addEventListener("click", (evt) => {
                // If click is outside any note or anchor
                if (!evt.target.closest(".note") && !evt.target.closest(".footnote-ref")) {
                    dehilightNotes();
                }
            });

            insertAndPositionSidenotes({ showFootnotes });

            // Also run on load to be sure
            window.addEventListener("load", () => {
                insertAndPositionSidenotes({ showFootnotes });
            });
        }
    }
}

// Initialize
initSidenotes({ showFootnotes: true });
