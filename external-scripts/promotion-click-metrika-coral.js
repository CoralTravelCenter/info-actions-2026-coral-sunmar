document.addEventListener("promotion-card:click", event => {
    const id = event.detail?.id;
    if (typeof id !== "string") return;

    let entryPoint;

    switch (id) {
        case "asian-weeks-2026":
            entryPoint = "asian_weeks";
            break;
        case "new-year-program-2026":
            entryPoint = "ny_normal_27";
            break;
        default:
            return;
    }

    if (typeof window.ym !== "function") return;

    window.ym(96674199, "reachGoal", "entry-point", {
        name_stock: {
            [entryPoint]: {
                name_point: "promo_page",
            },
        },
    });
});