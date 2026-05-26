// Este archivo controla la pagina dedicada a ediciones limitadas.
// Reutiliza el mismo JSON que el resto del sitio y solo muestra piezas especiales.
document.addEventListener("DOMContentLoaded", () => {
  loadLimitedCatalog();
});

// Carga los productos y filtra los que pertenecen a ediciones limitadas.
async function loadLimitedCatalog() {
  const container = document.getElementById("contenedor-productos");
  const modals = document.getElementById("contenedor-modales");

  if (!container || !modals) {
    return;
  }

  try {
    const response = await fetch("/src/data/products.json");

    if (!response.ok) {
      throw new Error("No se pudo cargar products.json");
    }

    const data = await response.json();
    const products = (data.products || [])
      .filter((product) => product.collection === "firmados-page")
      .filter(isLimitedEdition);

    container.innerHTML = products.map((product) => buildProductCard(product)).join("");
    modals.innerHTML = products.map((product) => buildStoreModal(product)).join("");
  } catch (error) {
    console.error("Error al cargar productos:", error);
    container.innerHTML = `<p class="text-center">Error al cargar productos.</p>`;
  }
}

// Decide si un producto debe aparecer en esta seccion.
// Se revisan textos como badge, categoria y nombre para detectar piezas firmadas o de coleccion.
function isLimitedEdition(product) {
  const value = `${product.badge || ""} ${product.category || ""} ${product.name || ""}`.toLowerCase();
  return value.includes("limitado") ||
    value.includes("legend") ||
    value.includes("coleccion") ||
    value.includes("firmado");
}

// Construye la card visible del producto.
function buildProductCard(product) {
  const modalId = getModalId(product.id);

  return `
    <div class="col-md-6 col-lg-4">
      <article class="product-card">
        <div class="product-image-wrapper">
          <img src="${escapeHtml(product.img)}" class="product-image" alt="${escapeHtml(product.name)}">
        </div>
        <div class="product-body">
          <span class="badge text-bg-${escapeHtml(product.badgeColor || "dark")}">${escapeHtml(product.badge || product.category)}</span>
          <h3>${escapeHtml(product.name)}</h3>
          <p>${escapeHtml(product.desc)}</p>
          <div class="d-flex justify-content-between align-items-center">
            <strong>${escapeHtml(product.price)}</strong>
            <button class="btn btn-sm btn-outline-dark" data-bs-toggle="modal" data-bs-target="#${modalId}">Ver</button>
          </div>
        </div>
      </article>
    </div>`;
}

// Construye el modal de detalle con el mismo formato usado por store.html.
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

// Crea un id valido para que Bootstrap pueda abrir el modal correcto.
function getModalId(id) {
  return `modal-${String(id).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

// Protege el HTML de valores dinamicos antes de insertarlos en la pagina.
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
