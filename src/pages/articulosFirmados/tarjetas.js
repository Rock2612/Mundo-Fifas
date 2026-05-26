// Funciones auxiliares
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatPrice(price) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(price);
}

// Imagen por defecto
const fallbackImage = "assets/img/placeholder.jpg";

// tarjetas.js
document.addEventListener("DOMContentLoaded", async () => {
  const contenedor = document.getElementById("contenedor-productos");
  const contenedorModales = document.getElementById("contenedor-modales");

  if (!contenedor || !contenedorModales) {
    return;
  }

  try {
    // IGUAL QUE EL PROYECTO QUE FUNCIONA
    const response = await fetch("/src/data/products.json");

    if (!response.ok) {
      throw new Error("No se pudo cargar products.json");
    }

    const data = await response.json();

    const todosLosProductos = [
      ...(data.firmados || []),
      ...(data.retro || []),
      ...(data.articulos || []),
    ];

    // Renderizar tarjetas
    contenedor.innerHTML = todosLosProductos
      .map((p, index) => {
        const image = p.img
          ? `../../${p.img}`
          : "../../assets/img/placeholder.jpg";

        return `
                <div class="col-md-6 col-lg-4">
                    <article class="product-card">

                        <div class="product-image-wrapper">
                            <img 
                                src="${escapeHtml(image)}"
                                class="product-image"
                                alt="${escapeHtml(p.nombre)}"
                            >
                        </div>

                        <div class="product-body">

                            <span class="badge text-bg-${escapeHtml(p.badgeColor || "dark")}">
                                ${escapeHtml(p.badge || "Producto")}
                            </span>

                            <h3>${escapeHtml(p.nombre)}</h3>

                            <p>${escapeHtml(p.descripcion)}</p>

                            <div class="d-flex justify-content-between align-items-center">

                                <strong>${formatPrice(p.precio)}</strong>

                                <button
                                    class="btn btn-sm btn-outline-dark"
                                    data-bs-toggle="modal"
                                    data-bs-target="#modal${p.id}"
                                >
                                    Ver
                                </button>

                            </div>
                        </div>
                    </article>
                </div>
            `;
      })
      .join("");

    // Renderizar modales
    contenedorModales.innerHTML = todosLosProductos
      .map(
        (p) => `
            <div class="modal fade" id="modal${p.id}" tabindex="-1">

                <div class="modal-dialog modal-dialog-centered modal-lg">

                    <div class="modal-content">

                        <div class="modal-header">

                            <h5 class="modal-title">
                                ${escapeHtml(p.nombre)}
                            </h5>

                            <button 
                                class="btn-close"
                                data-bs-dismiss="modal"
                            ></button>

                        </div>

                        <div class="modal-body">

                            <p>${escapeHtml(p.descripcion)}</p>

                            <span class="modal-price">
                                ${formatPrice(p.precio)}
                            </span>

                        </div>

                        <div class="modal-footer">

                            <button
                                class="btn btn-secondary"
                                data-bs-dismiss="modal"
                            >
                                Cerrar
                            </button>

                            <button
                                class="btn btn-dark add-cart"
                                data-name="${escapeHtml(p.nombre)}"
                            >
                                Agregar al carrito
                            </button>

                        </div>

                    </div>
                </div>
            </div>
        `,
      )
      .join("");
  } catch (error) {
    console.error("Error al cargar productos:", error);

    contenedor.innerHTML = `
            <p class="text-center">
                Error al cargar productos.
                Revisa la consola (F12).
            </p>
        `;
  }
});
