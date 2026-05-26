// Funciones auxiliares
function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
}

function fixImgPath(path) {
    if (!path) return '/src/assets/img/placeholder.jpg';
    if (path.startsWith('http')) return path;
    if (!path.startsWith('/src/')) return '/src/assets/img/placeholder.jpg';
    return path;
}

// tarjetas.js
document.addEventListener("DOMContentLoaded", async () => {
    const contenedor = document.getElementById('contenedor-productos');
    const contenedorModales = document.getElementById('contenedor-modales');
    if (!contenedor || !contenedorModales) return;

    try {
        const response = await fetch("/src/data/products.json");

        if (!response.ok) {
            throw new Error("No se pudo cargar el archivo: " + response.status);
        }

        const data = await response.json();
        const todosLosProductos = data.firmados
            .filter(p => p.id >= 21 && p.id <= 40 && p.img && p.img.trim() !== "");

        // 1. Renderizar Tarjetas
        contenedor.innerHTML = todosLosProductos.map(p => `
            <div class="col-md-6 col-lg-4">
                <article class="product-card">
                    <div class="product-image-wrapper">
                        <img 
                            src="${escapeHtml(fixImgPath(p.img))}" 
                            class="product-image" 
                            alt="${escapeHtml(p.nombre)}"
                            onerror="this.onerror=null;this.src='/src/assets/img/placeholder.jpg';"
                        >
                    </div>
                    <div class="product-body">
                        <span class="badge text-bg-${escapeHtml(p.badgeColor || 'dark')}">${escapeHtml(p.badge || "Producto")}</span>
                        <h3>${escapeHtml(p.nombre)}</h3>
                        <p>${escapeHtml(p.descripcion)}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <strong>${formatPrice(p.precio)}</strong>
                            <button class="btn btn-sm btn-outline-dark" data-bs-toggle="modal" data-bs-target="#modal${p.id}">Ver</button>
                        </div>
                    </div>
                </article>
            </div>
        `).join("");

        // 2. Renderizar Modales
        contenedorModales.innerHTML = todosLosProductos.map(p => `
            <div class="modal fade" id="modal${p.id}" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">${escapeHtml(p.nombre)}</h5>
                            <button class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <img 
                                src="${escapeHtml(fixImgPath(p.img))}" 
                                class="img-fluid rounded mb-3" 
                                alt="${escapeHtml(p.nombre)}"
                                onerror="this.onerror=null;this.src='/src/assets/img/placeholder.jpg';"
                            >
                            <p>${escapeHtml(p.descripcion)}</p>
                            <span class="modal-price">${formatPrice(p.precio)}</span>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                            <button class="btn btn-dark add-cart" data-name="${escapeHtml(p.nombre)}">Agregar al carrito</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error al cargar los productos:", error);
        contenedor.innerHTML = "<p class='text-center'>Error al cargar productos. Revisa la consola (F12).</p>";
    }
});