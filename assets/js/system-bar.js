document.addEventListener("DOMContentLoaded", function () {
    const mobileToggle = document.getElementById("system-bar-menu-toggle");
    const systemBarContent = document.querySelector(".system-bar-content");

    if (mobileToggle && systemBarContent) {
        mobileToggle.addEventListener("click", function (e) {
            e.stopPropagation();
            systemBarContent.classList.toggle("active");
            mobileToggle.classList.toggle("active");
        });

        // Close menu when clicking outside
        document.addEventListener("click", function (e) {
            if (systemBarContent.classList.contains("active") && !systemBarContent.contains(e.target) && e.target !== mobileToggle) {
                systemBarContent.classList.remove("active");
                mobileToggle.classList.remove("active");
            }
        });
    }
});
