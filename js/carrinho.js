/* Carrinho funcional no navegador; ainda não processa pagamentos. */
(function () {
    "use strict";

    const config = window.VERTT_ORDUM_CONFIG || {
        cartStorageKey: "vertt-ordum-cart",
        currency: "BRL",
        locale: "pt-BR"
    };

    const money = new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency: config.currency
    });

    let cart = loadCart();
    let overlay;

    function loadCart() {
        try {
            const saved = JSON.parse(localStorage.getItem(config.cartStorageKey) || "[]");
            if (!Array.isArray(saved)) return [];
            return saved.filter(function (item) {
                return item && typeof item.id === "string" &&
                    /^produto-[1-9][0-9]{0,2}$/.test(item.id) &&
                    typeof item.name === "string" && item.name.length > 0 &&
                    Number.isFinite(item.price) && item.price > 0 &&
                    Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99;
            }).slice(0, 100).map(function (item) {
                return {
                    id: item.id,
                    name: item.name.slice(0, 120),
                    price: Math.round(item.price * 100) / 100,
                    quantity: item.quantity
                };
            });
        } catch (_) {
            return [];
        }
    }

    function saveCart() {
        try {
            localStorage.setItem(config.cartStorageKey, JSON.stringify(cart));
        } catch (_) {
            /* O carrinho continua utilizável durante a sessão se o armazenamento estiver indisponível. */
        }
        updateCount();
    }

    function totalItems() {
        return cart.reduce(function (sum, item) {
            return sum + (Number.isInteger(item.quantity) ? item.quantity : 0);
        }, 0);
    }

    function updateCount() {
        const count = document.querySelector(".cart-icon small");
        if (count) count.textContent = String(totalItems());
        const cartLink = document.querySelector(".cart-icon");
        if (cartLink) cartLink.setAttribute("aria-label", "Carrinho, " + totalItems() + " item(ns)");
    }

    function addItem(product) {
        if (!product || typeof product.id !== "string" ||
            !/^produto-[1-9][0-9]{0,2}$/.test(product.id) ||
            typeof product.name !== "string" || !product.name.trim() ||
            !Number.isFinite(product.price) || product.price <= 0) return;

        const existing = cart.find(function (item) { return item.id === product.id; });
        if (existing) {
            if (existing.quantity >= 99) return;
            existing.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name.trim().slice(0, 120),
                price: Math.round(product.price * 100) / 100,
                quantity: 1
            });
        }
        saveCart();
        renderDrawer();
        openDrawer();
    }

    function ensureDrawer() {
        if (overlay) return;

        overlay = document.createElement("div");
        overlay.className = "cart-overlay";
        overlay.hidden = true;
        overlay.innerHTML = [
            '<button class="cart-backdrop" type="button" aria-label="Fechar carrinho"></button>',
            '<aside class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">',
            '  <div class="cart-drawer-heading">',
            '    <div><span class="section-label">SUA SELEÇÃO</span><h2 id="cart-title">CARRINHO</h2></div>',
            '    <button class="cart-close" type="button" aria-label="Fechar carrinho">×</button>',
            '  </div>',
            '  <div class="cart-items"></div>',
            '  <div class="cart-drawer-footer">',
            '    <div class="cart-total-row"><span>Subtotal</span><strong class="cart-total"></strong></div>',
            '    <p class="cart-note">O valor final de frete e as opções de pagamento serão definidos na etapa de finalização da loja.</p>',
            '    <button class="cart-checkout" type="button" disabled>FINALIZAÇÃO EM PREPARAÇÃO</button>',
            '    <button class="cart-continue" type="button">CONTINUAR COMPRANDO</button>',
            '  </div>',
            '</aside>'
        ].join("");
        document.body.appendChild(overlay);

        overlay.querySelector(".cart-backdrop").addEventListener("click", closeDrawer);
        overlay.querySelector(".cart-close").addEventListener("click", closeDrawer);
        overlay.querySelector(".cart-continue").addEventListener("click", closeDrawer);
        overlay.addEventListener("click", function (event) {
            const action = event.target.closest("[data-cart-action]");
            if (!action) return;
            const id = action.dataset.id;
            const item = cart.find(function (entry) { return entry.id === id; });
            if (!item) return;

            if (action.dataset.cartAction === "increase" && item.quantity < 99) item.quantity += 1;
            if (action.dataset.cartAction === "decrease") item.quantity -= 1;
            if (action.dataset.cartAction === "remove" || item.quantity <= 0) {
                cart = cart.filter(function (entry) { return entry.id !== id; });
            }
            saveCart();
            renderDrawer();
        });
    }

    function renderDrawer() {
        ensureDrawer();
        const list = overlay.querySelector(".cart-items");
        const total = cart.reduce(function (sum, item) {
            return sum + item.price * item.quantity;
        }, 0);

        if (!cart.length) {
            list.innerHTML = '<div class="cart-empty"><span>🛒</span><h3>Seu carrinho está vazio.</h3><p>Escolha os produtos que combinam com o cuidado do seu veículo.</p></div>';
        } else {
            list.innerHTML = cart.map(function (item) {
                return '<article class="cart-item">' +
                    '<div class="cart-item-copy"><h3>' + escapeHtml(item.name) + '</h3><p>' + money.format(item.price) + '</p>' +
                    '<div class="cart-quantity" aria-label="Quantidade">' +
                    '<button type="button" data-cart-action="decrease" data-id="' + escapeHtml(item.id) + '" aria-label="Diminuir quantidade">−</button>' +
                    '<span>' + item.quantity + '</span>' +
                    '<button type="button" data-cart-action="increase" data-id="' + escapeHtml(item.id) + '" aria-label="Aumentar quantidade">+</button>' +
                    '</div></div><div class="cart-item-side"><strong>' + money.format(item.price * item.quantity) + '</strong>' +
                    '<button class="cart-remove" type="button" data-cart-action="remove" data-id="' + escapeHtml(item.id) + '">Remover</button></div></article>';
            }).join("");
        }

        overlay.querySelector(".cart-total").textContent = money.format(total);
        const checkout = overlay.querySelector(".cart-checkout");
        checkout.disabled = true;
        checkout.textContent = cart.length ? "FINALIZAÇÃO EM PREPARAÇÃO" : "ADICIONE UM PRODUTO";
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return {
                "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
            }[character];
        });
    }

    function openDrawer() {
        ensureDrawer();
        renderDrawer();
        overlay.hidden = false;
        document.body.classList.add("cart-open");
        const closeButton = overlay.querySelector(".cart-close");
        if (closeButton) closeButton.focus();
    }

    function closeDrawer() {
        if (!overlay) return;
        overlay.hidden = true;
        document.body.classList.remove("cart-open");
    }

    document.addEventListener("vertt-ordum:add-to-cart", function (event) {
        addItem(event.detail);
    });

    document.addEventListener("DOMContentLoaded", function () {
        const cartLink = document.querySelector(".cart-icon");
        if (cartLink) {
            cartLink.addEventListener("click", function (event) {
                event.preventDefault();
                openDrawer();
            });
        }
        updateCount();
    });

    updateCount();
})();