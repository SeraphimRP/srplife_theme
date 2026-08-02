document.addEventListener("DOMContentLoaded", function () {
    const refs = document.querySelectorAll(".wiki-ref");
    if (!refs.length) return;

    function tooltipHeight(tooltip) {
        const prevVisibility = tooltip.style.visibility;
        const prevDisplay = tooltip.style.display;
        tooltip.style.visibility = "hidden";
        tooltip.style.display = "block";
        const height = tooltip.getBoundingClientRect().height;
        tooltip.style.visibility = prevVisibility;
        tooltip.style.display = prevDisplay;
        return height;
    }

    function positionTooltip(ref) {
        const tooltip = ref.querySelector(".wiki-ref-tooltip");
        if (!tooltip) return;

        const rect = ref.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const needed = tooltipHeight(tooltip);

        ref.classList.toggle(
            "wiki-ref-flip",
            spaceBelow < needed && spaceAbove > spaceBelow,
        );
    }

    refs.forEach((ref) => {
        ref.addEventListener("mouseenter", () => positionTooltip(ref));
        ref.addEventListener("focusin", () => positionTooltip(ref));
    });
});
