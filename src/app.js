// Este archivo controla el carrusel de productos firmados que aparece en index.html.
// Espera a que el HTML este listo antes de buscar elementos y cargar productos.
document.addEventListener("DOMContentLoaded", () => {
    loadSignedProducts();
});

// Guarda los productos firmados cargados desde el JSON para poder redibujar el carrusel.
let signedProducts = [];

// Define cuantas tarjetas van en cada slide segun el ancho actual de pantalla.
let currentProductsPerSlide = getProductsPerSlide();

// Imagen por defecto para productos del JSON que no tengan una ruta en "img".
const fallbackImages = [
    "assets/img/placeholder.jpg",
];

// Si cambia el ancho de pantalla, se recalcula cuantas tarjetas caben por slide.
// Solo se vuelve a renderizar cuando el numero realmente cambia.
window.addEventListener("resize", () => {
    const nextProductsPerSlide = getProductsPerSlide();

    if (nextProductsPerSlide === currentProductsPerSlide || !signedProducts.length) {
        return;
    }

    currentProductsPerSlide = nextProductsPerSlide;
    renderSignedProductsCarousel(signedProducts);
});

// Carga los productos firmados desde products.json y actualiza el carrusel.
async function loadSignedProducts() {
    const carouselInner = document.querySelector("#signedProductsCarouselInner");

    if (!carouselInner) {
        return;
    }

    try {
        // La ruta es relativa a index.html, que es donde se ejecuta app.js.
        const response = await fetch("data/products.json");

        if (!response.ok) {
            throw new Error("No se pudo cargar products.json");
        }

        const data = await response.json();
        // Esta seccion solo usa productos firmados del JSON unificado.
        const products = (data.products || []).filter((product) =>
            product.collection === "firmados-page" && product.category === "firmado"
        );
        signedProducts = products;

        if (!products.length) {
            carouselInner.innerHTML = getStatusSlide("No hay productos firmados disponibles.");
            return;
        }

        renderSignedProductsCarousel(products);
    } catch (error) {
        // Si el JSON no carga, se muestra un mensaje dentro del carrusel.
        carouselInner.innerHTML = getStatusSlide("Error al cargar los productos firmados.");
        console.error(error);
    }
}

// Actualiza el HTML del carrusel y reinicia Bootstrap para evitar estados rotos.
function renderSignedProductsCarousel(products) {
    const carousel = document.querySelector("#signedProductsCarousel");
    const carouselInner = document.querySelector("#signedProductsCarouselInner");
    const modalContainer = getSignedProductModalContainer();

    if (!carousel || !carouselInner) {
        return;
    }

    const bootstrapCarousel = bootstrap.Carousel.getInstance(carousel);

    if (bootstrapCarousel) {
        bootstrapCarousel.dispose();
    }

    carouselInner.innerHTML = buildCarouselSlides(products);
    modalContainer.innerHTML = products.map((product) => buildStoreModal(product)).join("");
    bootstrap.Carousel.getOrCreateInstance(carousel);
}

// Convierte la lista de productos en slides de Bootstrap segun el ancho de pantalla.
function buildCarouselSlides(products) {
    return chunkProducts(products, currentProductsPerSlide)
        .map((group, index) => `
            <div class="carousel-item ${index === 0 ? "active" : ""}">
                <div class="row g-4">
                    ${group.map((product, productIndex) => buildProductCard(product, index * currentProductsPerSlide + productIndex)).join("")}
                </div>
            </div>
        `)
        .join("");
}

// Crea el HTML de una tarjeta usando los campos de cada producto del JSON.
// La tarjeta completa abre el modal del producto.
function buildProductCard(product, index) {
    const image = product.img || fallbackImages[index % fallbackImages.length];
    const badgeColor = product.badgeColor || "dark";

    return `
        <div class="col-md-6 col-xl-3">
            <article class="product-card" role="button" data-bs-toggle="modal" data-bs-target="#${getModalId(product.id)}">
                <div class="product-image-wrapper">
                    <img src="${escapeHtml(image)}" class="product-image" alt="${escapeHtml(product.name)}">
                </div>
                <div class="product-body">
                    <span class="badge text-bg-${escapeHtml(badgeColor)}">${escapeHtml(product.badge || "Firmado")}</span>
                    <h3>${escapeHtml(product.name)}</h3>
                    <p>${escapeHtml(product.desc)}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <strong>${escapeHtml(product.price)}</strong>
                        <button class="btn btn-sm btn-outline-dark" data-bs-toggle="modal" data-bs-target="#${getModalId(product.id)}">Ver</button>
                    </div>
                </div>
            </article>
        </div>
    `;
}

// Construye el modal de producto con el mismo formato visual que usa la tienda.
// Incluye imagen, detalles, precio, resenas y boton para agregar al carrito global.
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
        </div>
    `;
}

// Crea o recupera el contenedor donde se colocan los modales del carrusel.
// Se agrega al body porque los modales no deben quedar dentro de la estructura del carousel.
function getSignedProductModalContainer() {
    let container = document.getElementById("signedProductModals");

    if (!container) {
        container = document.createElement("div");
        container.id = "signedProductModals";
        document.body.appendChild(container);
    }

    return container;
}

// Convierte cualquier id de producto en un id valido para HTML.
function getModalId(id) {
    return `modal-${String(id).replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

// Define cuantas tarjetas se muestran por slide: 1 en mobile, 2 en tablet, 4 en desktop.
function getProductsPerSlide() {
    if (window.innerWidth < 768) {
        return 1;
    }

    if (window.innerWidth < 1200) {
        return 2;
    }

    return 4;
}

// Divide un arreglo en grupos pequenos para formar las paginas del carrusel.
function chunkProducts(products, size) {
    const chunks = [];

    for (let index = 0; index < products.length; index += size) {
        chunks.push(products.slice(index, index + size));
    }

    return chunks;
}

// Formatea el precio como moneda mexicana sin decimales.
// Se mantiene por compatibilidad, aunque los productos nuevos ya traen el precio formateado.
function formatPrice(price) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0
    }).format(price);
}

// Genera un slide simple para estados como carga, error o lista vacia.
function getStatusSlide(message) {
    return `
        <div class="carousel-item active">
            <div class="product-loading">${escapeHtml(message)}</div>
        </div>
    `;
}

// Escapa texto dinamico antes de insertarlo en innerHTML.
function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
