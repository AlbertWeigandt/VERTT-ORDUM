/* Liga os produtos por identificadores fixos e oferece busca no catálogo. */
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

    const searchInput = document.querySelector("[data-catalog-search]");
    const cards = Array.from(document.querySelectorAll(".catalog-grid .product-card"));
    const count = document.querySelector("[data-catalog-count]");
    const empty = document.querySelector("[data-catalog-empty]");

    function normalize(value) {
        return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    }

    function filterCatalog(term) {
        const query = normalize(term);
        let visible = 0;

        cards.forEach(function (card) {
            const matches = !query || normalize(card.textContent).includes(query);
            card.hidden = !matches;
            if (matches) visible += 1;
        });

        if (count) count.textContent = visible + (visible === 1 ? " produto encontrado" : " produtos encontrados");
        if (empty) empty.hidden = visible !== 0;
    }

    if (searchInput) {
        const initial = new URLSearchParams(window.location.search).get("busca") || "";
        searchInput.value = initial;
        searchInput.addEventListener("input", function () { filterCatalog(searchInput.value); });
        filterCatalog(initial);
    }

    document.querySelectorAll("[data-search-open]").forEach(function (button) {
        button.addEventListener("click", function () {
            if (searchInput) {
                searchInput.focus();
                searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
                return;
            }
            const destination = button.dataset.searchUrl;
            if (destination) window.location.href = destination + "?busca=";
        });
    });
})();
