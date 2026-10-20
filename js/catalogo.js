/* Liga os cartões de produto às ações da loja. */
(function () {
    "use strict";

    function parsePrice(text) {
        const normalized = text
            .replace(/[^0-9,.-]/g, "")
            .replace(/\./g, "")
            .replace(",", ".");
        const value = Number(normalized);
        return Number.isFinite(value) ? value : 0;
    }

    document.querySelectorAll(".product-card").forEach(function (card, index) {
        const title = card.querySelector("h3");
        const price = card.querySelector(".price");
        const button = card.querySelector(".add-cart");

        if (!title || !price || !button) return;

        const product = {
            id: "produto-" + (index + 1),
            name: title.textContent.trim(),
            price: parsePrice(price.textContent),
            imageClass: Array.from(card.querySelector(".product-image")?.classList || [])
                .find(function (className) { return /^product-\d+$/.test(className); }) || ""
        };

        button.dataset.productId = product.id;
        button.addEventListener("click", function () {
            document.dispatchEvent(new CustomEvent("vertt-ordum:add-to-cart", {
                detail: product
            }));
        });
    });
})();