document.addEventListener("promotion-card:click", event => {
  const {name} = event.detail;
  let entryPoint;

  switch (name) {
    case "На всё готовое — в Новый год":
      entryPoint = "NY_26_27";
      break;
    case "Ловите двойную волну выгоды!":
      entryPoint = "hotels_of_the_week";
      break;
    case "Хотим на море!":
      entryPoint = "june_26";
      break;
    default:
      return;
  }

  window.ym(215233, "reachGoal", "entry-point", {
    name_stock: {
      [entryPoint]: {name_point: "promo_page"},
    },
  });
});
