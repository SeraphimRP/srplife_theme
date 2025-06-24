let postClass = "main-content-area";
let postSelector = "div.post-content";
let notesWrapperSelector = ".notes-wrapper";
let footnoteRefSelector = ".footnote-ref";

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
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
    document.querySelector(postSelector).classList.remove("hide-sidenotes");
}

function hideSidenotes() {
    document.querySelector(postSelector).classList.add("hide-sidenotes");
}

function showEndnotes() {
    document.querySelector(postSelector).classList.remove("hide-endnotes");
}

function hideEndnotes() {
    document.querySelector(postSelector).classList.add("hide-endnotes");
}

function insertSidenotes() {
    const postContent = document.querySelector(postSelector);

    for (const child of postContent.children) {
        if (child.classList.contains(notesWrapperSelector.slice(1))) {
            continue;
        }

        const anchors = child.querySelectorAll(footnoteRefSelector);

        if (anchors.length) {
            const sidenoteContainer = document.createElement("div");
            sidenoteContainer.setAttribute("class", notesWrapperSelector.slice(1));

            for (let anchor of anchors) {
                const aref = anchor.firstChild;
                const id = aref.id;
                const contentId = id.replace("ref", "");

                const content = document.getElementById(contentId);
                const sidenoteWrapper = document.createElement("aside");

                sidenoteWrapper.setAttribute("id", id.replace("ref", ""));
                sidenoteWrapper.setAttribute("class", "note");
                sidenoteWrapper.setAttribute("role", "note");
                sidenoteWrapper.setAttribute("data-anchor-id", id);

                sidenoteWrapper.innerHTML = content.innerHTML;

                // Remove "jump back to text" link, since it'll be right next to the anchor
                const links = sidenoteWrapper.querySelectorAll("a");
                const lastLink = links[links.length - 1];
                if (lastLink && lastLink.textContent === "↩︎") {
                    lastLink.remove();
                }

                sidenoteWrapper.insertAdjacentHTML("afterbegin", `<div class='note-identifier'>${anchor.textContent}</div>`);
                sidenoteContainer.insertAdjacentElement("beforeend", sidenoteWrapper);
            }

            child.insertAdjacentElement("afterend", sidenoteContainer);
        }
    }
}

// This function needs some work. Whatever it does, it offsets exponentially.
// A solution would be to maybe force overlapping ones into a sort of table where
// they can be effectively side-by-side while not looking like garbage.
function positionSidenotes() {
    const sidenotes = document.querySelectorAll("aside.note");

    for (let i = 0; i < sidenotes.length; i++) {
        const sidenote = sidenotes[i];

        const anchorId = sidenote.getAttribute("data-anchor-id");
        const anchor = document.querySelector(`${postSelector} > *:not(${notesWrapperSelector}, .footnotes) #${anchorId}`);
        const anchorParent = anchor.parentNode;
        const anchorPosition = anchor.getBoundingClientRect().top;
        const anchorParentPosition = anchorParent.getBoundingClientRect().top;

        // Bump down sidenote if it would overlap with the previous one
        let newPosition = anchorPosition;
        if (i > 0) {
            const prevSideNote = sidenotes[i - 1];
            const prevSidenoteEnd = prevSideNote.getBoundingClientRect().bottom;
            if (anchorPosition < prevSidenoteEnd) {
                newPosition = prevSidenoteEnd + 20;
            }
        }

        let offset = Math.round(newPosition - anchorParentPosition);
        if (offset != 0) {
            sidenote.style.top = `${offset}px`;
        }

        // let offset = Math.round(newPosition - anchorParentPosition);
        // if (offset != 0) {
        //     sidenote.style.top = `calc(${offset}px - calc(${i + 1} * 3.25vh))`;
        // } else if (i > 0) {
        //     sidenote.style.top = `calc(-15vh - calc(${i + 1} * 6.5vh))`
        // }
    }
}

function insertAndPositionSidenotes({ showFootnotes }) {
    const mediaQuery = window.matchMedia("(min-width: 65rem)");

    if (mediaQuery.matches) {
        insertSidenotes({ showFootnotes });
        positionSidenotes();
        hideEndnotes();
        setTimeout(() => positionSidenotes(), 200);
    }
}

function onResize() {
    const sidenotesInDom = Boolean(document.querySelector(notesWrapperSelector));
    const mediaQuery = window.matchMedia("(min-width: 65rem)");

    if (mediaQuery.matches) {
        if (!sidenotesInDom) {
            insertSidenotes({ showFootnotes: true });
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
        const sidenote = document.querySelector("aside#" + evt.target.parentNode.firstChild.id.replace("ref", ""));

        if (sidenote) {
            evt.preventDefault();
            evt.stopPropagation();

            const sidenote = document.querySelector("aside#" + evt.target.parentNode.firstChild.id.replace("ref", ""));
            sidenote.classList.add("active-sidenote");
        }
    }
}

function dehilightNotes() {
    const highlighted = document.querySelectorAll(".active-sidenote");
    for (let highlight of highlighted) {
        highlight.classList.remove("active-sidenote");
    }
}

function sidenotes({ showFootnotes = true } = {}) {
    if (document.getElementsByTagName("main")[0].classList.contains(postClass)) {
        if (showFootnotes) {
            window.addEventListener("resize", debounce(onResize, 100));
            window.addEventListener("resize", debounce(onResize, 100));

            const anchors = document.querySelectorAll(footnoteRefSelector);

            for (const anchor of anchors) {
                anchor.addEventListener("click", onAnchorClick);
            }

            document.addEventListener("click", (evt) => {
                if (evt.target.nodeName !== "A") {
                    dehilightNotes();
                }
            });

            insertAndPositionSidenotes({ showFootnotes });
        }
    }
}

sidenotes({ showFootnotes: true });
