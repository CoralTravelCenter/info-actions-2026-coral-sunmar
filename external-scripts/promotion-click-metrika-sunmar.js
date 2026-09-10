document.addEventListener("promotion-card:click", event => {
    const id = event.detail?.id;
    if (typeof id !== "string") return;

    let entryPoint;

    switch (id) {
        case "family-early-booking-2027":
            entryPoint = "eb_winter_27";
            break;
        case "new-year-ready-2026":
            entryPoint = "NY_26_27";
            break;
        default:
            return;
    }

    if (typeof window.ym !== "function") return;

    window.ym(215233, "reachGoal", "entry_point", {
        name_stock: {
            [entryPoint]: {
                name_point: "promo_page",
            },
        },
    });
});