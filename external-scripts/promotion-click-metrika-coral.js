document.addEventListener("promotion-card:click", event => {
  const {name} = event.detail;
  let entryPoint;

  switch (name) {
    case "Азиатские недели с Coral Travel":
      entryPoint = "asian_weeks";
      break;
    case "Зажгите новогоднее настроение":
      entryPoint = "ny_normal_27";
      break;
    case "Выгодные путешествия летом!":
      entryPoint = "june_26";
      break;
    default:
      return;
  }

  window.ym(96674199, "reachGoal", "entry-point", {
    name_stock: {
      [entryPoint]: {name_point: "promo_page"},
    },
  });
});
