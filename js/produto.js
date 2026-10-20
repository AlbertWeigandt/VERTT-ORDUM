/* Comportamentos específicos das páginas de produto. */
(function () {
    "use strict";

    document.querySelectorAll("[data-detail-product]").forEach(function (button) {
        button.addEventListener("click", function () {
            document.dispatchEvent(new CustomEvent("vertt-ordum:add-to-cart", {
                detail: {
                    id: "shampoo-automotivo-premium-1l",
                    name: "Shampoo Automotivo Premium 1L",
                    price: 49.90
                }
            }));
        });
    });
})();