// Nombre de la llave donde se guarda el carrito en localStorage.
// Usar una constante evita escribir el texto varias veces y facilita cambiarlo despues.
const CART_STORAGE_KEY = "giftForFifasCart";

// Aqui se guarda en memoria la lista completa de productos del JSON.
// El carrito solo guarda ids y cantidades; la informacion completa se consulta aqui.
let cartProducts = [];

// Cuando el documento termina de cargar, se inicia el carrito global.
document.addEventListener("DOMContentLoaded", () => {
  initGlobalCart();
});

// Prepara todo lo necesario para que el carrito funcione en cualquier pagina.
// Primero crea el panel lateral, despues conecta eventos, carga productos y pinta el estado actual.
async function initGlobalCart() {
  ensureCartDrawer();
  bindCartEvents();
  await loadCartProducts();
  renderCart();
}

// Lee el JSON unificado de productos para poder buscar datos como nombre, precio e imagen.
// Si falla, se deja el arreglo vacio para evitar que el resto del sitio se rompa.
async function loadCartProducts() {
  try {
    const response = await fetch("/src/data/products.json");

    if (!response.ok) {
      throw new Error("No se pudo cargar products.json");
    }

    const data = await response.json();
    cartProducts = data.products || [];
  } catch (error) {
    console.error("Error al cargar productos para carrito:", error);
    cartProducts = [];
  }
}

// Escucha clicks de todo el documento usando delegacion de eventos.
// Esto permite que tambien funcionen botones creados despues por JavaScript.
function bindCartEvents() {
  document.addEventListener("click", (event) => {
    const addButton = event.target.closest(".add-cart");
    const openButton = event.target.closest(".js-cart-open");
    const removeButton = event.target.closest(".js-cart-remove");
    const clearButton = event.target.closest(".js-cart-clear");
    const checkoutButton = event.target.closest(".js-cart-checkout");

    if (addButton) {
      event.preventDefault();
      addProductToCart(addButton.dataset.productId, addButton.dataset.name);
      return;
    }

    if (openButton) {
      event.preventDefault();
      openCartDrawer();
      return;
    }

    if (removeButton) {
      removeCartItem(removeButton.dataset.productId);
      return;
    }

    if (clearButton) {
      saveCart([]);
      renderCart();
      return;
    }

    if (checkoutButton) {
      const cart = getCart();

      if (!cart.length) {
        showSiteAlert("Tu carrito esta vacio.", "warning");
        return;
      }

      showSiteAlert("Gracias por tu compra.", "success");
      saveCart([]);
      renderCart();
    }
  });
}

// Agrega un producto al carrito usando su id.
// Si el producto ya existe, solo aumenta la cantidad; si no existe, lo crea.
async function addProductToCart(productId, fallbackName) {
  if (!cartProducts.length) {
    await loadCartProducts();
  }

  const product = cartProducts.find((item) => String(item.id) === String(productId));

  if (!product) {
    console.warn("Producto no encontrado para carrito:", productId || fallbackName);
    return;
  }

  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      priceValue: product.priceValue || 0,
      img: product.img,
      quantity: 1,
    });
  }

  saveCart(cart);
  renderCart();
  showCartFeedback(product.name);
}

// Elimina un producto completo del carrito segun su id.
function removeCartItem(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
}

// Obtiene el carrito guardado en localStorage.
// El try evita errores si el dato guardado esta corrupto o no es JSON valido.
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

// Guarda el carrito completo en localStorage para conservarlo entre paginas y recargas.
function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

// Redibuja el carrito en pantalla: contador, lista, total y mensaje de carrito vacio.
function renderCart() {
  const cart = getCart();
  const list = document.getElementById("globalCartList");
  const total = document.getElementById("globalCartTotal");
  const empty = document.getElementById("globalCartEmpty");
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = cart.reduce((sum, item) => sum + (Number(item.priceValue) || 0) * item.quantity, 0);

  document.querySelectorAll(".cart-count").forEach((counter) => {
    counter.textContent = count;
  });

  if (!list || !total || !empty) {
    return;
  }

  empty.hidden = cart.length > 0;
  list.innerHTML = cart.map((item) => `
    <li class="cart-line">
      <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.name)}">
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.price)} x ${item.quantity}</span>
      </div>
      <button class="cart-remove js-cart-remove" type="button" data-product-id="${escapeHtml(item.id)}">x</button>
    </li>
  `).join("");
  total.textContent = `$${totalValue.toLocaleString("es-MX")} MXN`;
}

// Crea el offcanvas del carrito si la pagina todavia no lo tiene.
// Se inyecta desde JavaScript para no repetir el mismo HTML en todas las paginas.
function ensureCartDrawer() {
  if (document.getElementById("globalCartDrawer")) {
    return;
  }

  document.body.insertAdjacentHTML("beforeend", `
    <div class="cart-toast site-toast" id="siteToast" role="status" aria-live="polite" aria-atomic="true"></div>
    <div class="offcanvas offcanvas-end global-cart" tabindex="-1" id="globalCartDrawer">
      <div class="offcanvas-header">
        <div>
          <span class="section-kicker">Carrito</span>
          <h5 class="offcanvas-title">Tu seleccion</h5>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
      </div>
      <div class="offcanvas-body">
        <p class="text-secondary" id="globalCartEmpty">Aun no agregas productos.</p>
        <ul class="cart-list" id="globalCartList"></ul>
        <div class="cart-summary">
          <span>Total</span>
          <strong id="globalCartTotal">$0 MXN</strong>
        </div>
        <button class="btn btn-accent w-100 mt-3 js-cart-checkout" type="button">Finalizar compra</button>
        <button class="btn btn-outline-dark w-100 mt-2 js-cart-clear" type="button">Vaciar carrito</button>
      </div>
    </div>
  `);
}

// Abre el panel lateral del carrito usando el componente Offcanvas de Bootstrap.
function openCartDrawer() {
  const drawer = document.getElementById("globalCartDrawer");

  if (!drawer || !window.bootstrap) {
    return;
  }

  bootstrap.Offcanvas.getOrCreateInstance(drawer).show();
}

// Muestra una notificacion temporal cuando se agrega un producto.
function showCartFeedback(name) {
  showSiteAlert(`${name} agregado al carrito`, "success");
}

// Muestra una alerta visual consistente en cualquier pagina del sitio.
function showSiteAlert(message, type = "success") {
  let toast = document.getElementById("siteToast");

  if (!toast) {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="cart-toast site-toast" id="siteToast" role="status" aria-live="polite" aria-atomic="true"></div>
    `);
    toast = document.getElementById("siteToast");
  }

  const icon = type === "warning" ? "!" : "+";

  toast.classList.remove("show", "site-toast-warning", "site-toast-success");
  toast.classList.add(type === "warning" ? "site-toast-warning" : "site-toast-success");
  toast.innerHTML = `
    <span class="site-toast-icon" aria-hidden="true">${icon}</span>
    <span class="site-toast-message">${escapeHtml(message)}</span>
  `;

  clearTimeout(toast.hideTimer);
  toast.classList.add("show");
  toast.hideTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

window.showSiteAlert = showSiteAlert;

// Escapa texto dinamico antes de insertarlo como HTML.
// Esto evita que nombres o descripciones rompan el marcado de la pagina.
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
