/* Comportamentos específicos das páginas de produto. */
(function () {
    "use strict";

    document.querySelectorAll("[data-detail-product]").forEach(function (button) {
        button.addEventListener("click", function () {
            const product = {
                id: button.dataset.productId,
                name: button.dataset.productName,
                price: Number(button.dataset.productPrice)
            };

            if (!/^produto-[1-9][0-9]{0,2}$/.test(product.id || "") ||
                !product.name || !Number.isFinite(product.price) || product.price <= 0) return;

            document.dispatchEvent(new CustomEvent("vertt-ordum:add-to-cart", {
                detail: product
            }));
        });
    });
})();
