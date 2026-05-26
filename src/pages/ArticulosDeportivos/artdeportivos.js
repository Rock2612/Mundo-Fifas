// Guarda en memoria los productos deportivos cargados desde el JSON.
let productos = [];

// Referencias a los elementos principales de la pagina.
const contenedor = document.getElementById("contenedor-productos");
const searchBtn = document.querySelector(".search-btn");
const filterButtons = document.querySelectorAll(".filters button");

// Cuando el HTML esta listo se carga el catalogo deportivo.
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos();
});

// Obtiene todos los productos desde el JSON central y se queda solo con la coleccion de articulos deportivos.
async function cargarProductos() {
  try {
    const response = await fetch("/src/data/products.json");

    if (!response.ok) {
      throw new Error("No se pudo cargar products.json");
    }

    const data = await response.json();
    productos = (data.products || []).filter((product) => product.collection === "articulos-deportivos");
    renderizarProductos(productos);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    contenedor.innerHTML = `<p class="text-center">Error al cargar productos.</p>`;
  }
}

// Renderiza las cards visibles de productos deportivos.
// Cada card incluye un boton para abrir el modal y otro para agregar al carrito global.
function renderizarProductos(lista) {
  contenedor.innerHTML = lista.map((producto) => `
    <div class="col-md-6 col-lg-3 producto-item ${escapeHtml(producto.category)}">
      <div class="product-card">
        <div class="img-container">
          <img src="${escapeHtml(producto.img)}" alt="${escapeHtml(producto.name)}">
        </div>
        <div class="card-body">
          <h5>${escapeHtml(producto.name)}</h5>
          <p>${escapeHtml(producto.desc)}</p>
          <div class="price">${escapeHtml(producto.price)}</div>
          <div class="d-grid gap-2">
            <button class="btn btn-outline-dark" data-bs-toggle="modal" data-bs-target="#${getModalId(producto.id)}">Ver mas</button>
            <button class="btn add-cart-btn add-cart" data-product-id="${escapeHtml(producto.id)}" data-name="${escapeHtml(producto.name)}">
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  renderProductModals(lista);
}

// Crea o actualiza los modales asociados a los productos que se estan mostrando.
// Si se aplica un filtro, se regeneran los modales para coincidir con la lista filtrada.
function renderProductModals(lista) {
  let modals = document.getElementById("sportsProductModals");

  if (!modals) {
    modals = document.createElement("div");
    modals.id = "sportsProductModals";
    document.body.appendChild(modals);
  }

  modals.innerHTML = lista.map((product) => buildStoreModal(product)).join("");
}

// Construye el modal estilo tienda para un producto deportivo.
function buildStoreModal(product) {
  const detailsHTML = (product.details || [])
    .map((detail) => `<li><span>${escapeHtml(detail.label)}</span><strong>${escapeHtml(detail.value)}</strong></li>`)
    .join("");

  return `
    <div class="modal fade" id="${getModalId(product.id)}" tabindex="-1">
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

// Conecta los botones de filtro.
// "all" muestra todos; cualquier otro valor filtra por la propiedad category.
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filter = button.dataset.filter;
    const filteredProducts = filter === "all"
      ? productos
      : productos.filter((producto) => producto.category === filter);

    renderizarProductos(filteredProducts);
  });
});

// Buscador simple por nombre de producto.
// Usa prompt para pedir texto y vuelve a pintar solo los resultados encontrados.
searchBtn.addEventListener("click", () => {
  const texto = prompt("Buscar producto:");

  if (!texto) {
    return;
  }

  const busqueda = texto.toLowerCase();
  const filtrados = productos.filter((producto) =>
    producto.name.toLowerCase().includes(busqueda),
  );

  renderizarProductos(filtrados);
});

// Convierte ids del JSON en ids validos para los modales de Bootstrap.
function getModalId(id) {
  return `modal-${String(id).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

// Escapa texto dinamico antes de insertarlo en HTML.
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
