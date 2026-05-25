// Espera a que el HTML este listo antes de buscar elementos y cargar productos.
document.addEventListener("DOMContentLoaded", () => {
    loadSignedProducts();
});

let signedProducts = [];
let currentProductsPerSlide = getProductsPerSlide();

// Imagen por defecto para productos del JSON que no tengan una ruta en "img".
const fallbackImages = [
    "assets/img/placeholder.jpg",
];

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
        // Esta seccion solo usa la categoria "firmados" del JSON.
        const products = Array.isArray(data.firmados) ? data.firmados : [];
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

    if (!carousel || !carouselInner) {
        return;
    }

    const bootstrapCarousel = bootstrap.Carousel.getInstance(carousel);

    if (bootstrapCarousel) {
        bootstrapCarousel.dispose();
    }

    carouselInner.innerHTML = buildCarouselSlides(products);
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
function buildProductCard(product, index) {
    const image = product.img || fallbackImages[index % fallbackImages.length];
    const badgeColor = product.badgeColor || "dark";

    return `
        <div class="col-md-6 col-xl-3">
            <article class="product-card">
                <div class="product-image-wrapper">
                    <img src="${escapeHtml(image)}" class="product-image" alt="${escapeHtml(product.nombre)}">
                </div>
                <div class="product-body">
                    <span class="badge text-bg-${escapeHtml(badgeColor)}">${escapeHtml(product.badge || "Firmado")}</span>
                    <h3>${escapeHtml(product.nombre)}</h3>
                    <p>${escapeHtml(product.descripcion)}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <strong>${formatPrice(product.precio)}</strong>
                        <button class="btn btn-sm btn-outline-dark">Ver</button>
                    </div>
                </div>
            </article>
        </div>
    `;
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
