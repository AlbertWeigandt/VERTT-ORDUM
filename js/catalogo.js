/* Liga cada cartão a um identificador fixo de produto. */
(function () {
    "use strict";

    function parsePrice(text) {
        const normalized = String(text || "")
            .replace(/[^0-9,.-]/g, "")
            .replace(/\./g, "")
            .replace(",", ".");
        const value = Number(normalized);
        return Number.isFinite(value) ? value : 0;
    }

    document.querySelectorAll(".product-card").forEach(function (card) {
        const title = card.querySelector("h3");
        const price = card.querySelector(".price");
        const button = card.querySelector(".add-cart");
        const id = card.dataset.productId;

        if (!title || !price || !button || !/^produto-[1-9][0-9]{0,2}$/.test(id || "")) return;

        const product = {
            id: id,
            name: title.textContent.trim(),
            price: parsePrice(price.textContent),
            imageClass: Array.from(card.querySelector(".product-image")?.classList || [])
                .find(function (className) { return /^product-\d+$/.test(className); }) || ""
        };

        if (!Number.isFinite(product.price) || product.price <= 0) return;

        button.dataset.productId = product.id;
        button.addEventListener("click", function () {
            document.dispatchEvent(new CustomEvent("vertt-ordum:add-to-cart", {
                detail: product
            }));
        });
    });
})();
