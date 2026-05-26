// Este archivo renderiza la pagina de tienda retro.
// Lee el JSON unificado, filtra los productos de la coleccion "store" y crea cards y modales.
document.addEventListener("DOMContentLoaded", () => {
  loadStoreProducts();
});

// Carga los productos desde el JSON central del proyecto.
async function loadStoreProducts() {
  try {
    const response = await fetch("/src/data/products.json");

    if (!response.ok) {
      throw new Error("No se pudo cargar products.json");
    }

    const data = await response.json();
    const products = (data.products || []).filter((product) => product.collection === "store");

    renderStoreProducts(products, {
      gridId: "retro-grid",
      modalsId: "retro-modals",
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

// Pinta las cards dentro del grid y los modales dentro del contenedor de modales.
function renderStoreProducts(products, options) {
  const grid = document.getElementById(options.gridId);
  const modals = document.getElementById(options.modalsId);

  if (!grid || !modals) {
    return;
  }

  grid.innerHTML = products.map((product) => buildStoreCard(product)).join("");
  modals.innerHTML = products.map((product) => buildStoreModal(product)).join("");
}

// Crea la card visual de la tienda.
// Cada card tiene boton para ver el modal y boton para agregar al carrito global.
function buildStoreCard(product) {
  const modalId = getModalId(product.id);

  return `
    <article class="retro-card">
      <div class="card-img-wrap">
        <img src="${escapeHtml(product.img)}" alt="${escapeHtml(product.name)}">
        <div class="card-year">${escapeHtml(product.year)}</div>
      </div>
      <div class="card-body-inner">
        <div class="card-brand">${escapeHtml(product.brand)}</div>
        <h2>${escapeHtml(product.name)}</h2>
        <p class="desc">${escapeHtml(product.desc)}</p>
        <div class="card-meta">
          <span class="price">${escapeHtml(product.price)}</span>
          <span class="reviews">${escapeHtml(product.stars)} <em>${escapeHtml(product.reviews)}</em></span>
        </div>
        <div class="card-buttons">
          <button class="btn-ver" data-bs-toggle="modal" data-bs-target="#${modalId}">Ver mas</button>
          <button class="btn-cart add-cart" data-product-id="${escapeHtml(product.id)}" data-name="${escapeHtml(product.name)}">+ Carrito</button>
        </div>
      </div>
    </article>`;
}

// Crea el modal de detalle de un producto.
// Este formato es el que se reutiliza en otras paginas del proyecto.
function buildStoreModal(product) {
  const modalId = getModalId(product.id);
  const detailsHTML = (product.details || [])
    .map((detail) => `<li><span>${escapeHtml(detail.label)}</span><strong>${escapeHtml(detail.value)}</strong></li>`)
    .join("");

  return `
    <div class="modal fade" id="${modalId}" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content store-modal">
          <div class="modal-header">
            <div>
              <div class="modal-brand">${escapeHtml(product.brand)} - ${escapeHtml(product.year)}</div>
              <h5 class="modal-title">${escapeHtml(product.name)}</h5>
            </div>
            <button class="btn-close-custom" data-bs-dismiss="modal" aria-label="Cerrar">x</button>
          </div>
          <div class="modal-body">
            <div class="modal-img-col">
              <img src="${escapeHtml(product.img)}" class="modal-img" alt="${escapeHtml(product.name)}">
            </div>
            <div class="modal-info-col">
              <p>${escapeHtml(product.modalDesc || product.desc)}</p>
              <ul class="retro-details">${detailsHTML}</ul>
              <div class="modal-price-row">
                <span class="modal-price">${escapeHtml(product.price)}</span>
                <span class="modal-reviews">${escapeHtml(product.stars)} ${escapeHtml(product.reviews)} resenas</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-modal-close" data-bs-dismiss="modal">Cerrar</button>
            <button class="btn-modal-cart add-cart" data-product-id="${escapeHtml(product.id)}" data-name="${escapeHtml(product.name)}" data-bs-dismiss="modal">Agregar al carrito</button>
          </div>
        </div>
      </div>
    </div>`;
}

// Convierte el id de producto en un id seguro para usarlo en data-bs-target.
function getModalId(id) {
  return `modal-${String(id).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

// Limpia texto dinamico antes de insertarlo en HTML.
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
