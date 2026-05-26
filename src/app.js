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





//**********************************Funcionalidad del carrito*********************************** */

const carrito = document.querySelector('#carrito');
const contenedorCarrito = document.querySelector('#lista-carrito tbody');
const vaciarCarritoBtn = document.querySelector('#vaciar-carrito');
const listaProductos = document.querySelector('#lista-productos');
let productosCarrito = [];

cargarEventListener();
function cargarEventListener() {
    listaProductos.addEventListener('click', agregarProducto);
    carrito.addEventListener('click', eliminarProducto);
    vaciarCarritoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        productosCarrito = [];
        while(contenedorCarrito.firstChild){
            contenedorCarrito.removeChild(contenedorCarrito.firstChild)
        }
        console.log(productosCarrito)
    });
}


function agregarProducto(e) {
    e.preventDefault();
    if(e.target.classList.contains('agregar-carrito')) {
        const productoSeleccionado = e.target.parentElement.parentElement.parentElement;
        crearObjetoProducto(productoSeleccionado);
    }
}

function crearObjetoProducto(producto) {
    const infoProducto = {
        imagen: producto.querySelector('img').src,
        nombre: producto.querySelector('h3').textContent,
        precio: producto.querySelector('strong').textContent,
        cantidad: 1,
        id: producto.querySelector('button').getAttribute('data-id')
    }
    const existe = productosCarrito.some(item => item.id === infoProducto.id);
    if (existe) {
        const productos = productosCarrito.map((producto) => {
            if(producto.id === infoProducto.id) {
                producto.cantidad++
                return producto
            } else {
                return producto
            }
        })
        productosCarrito = [...productos]
    } else {
        productosCarrito = [...productosCarrito, infoProducto];
    }
    pintarCarrito();
    console.log(productosCarrito)
}

function pintarCarrito() {
    while(contenedorCarrito.firstChild){
        contenedorCarrito.removeChild(contenedorCarrito.firstChild)
    }
    productosCarrito.forEach((producto) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${producto.imagen}" width="40" height="40" style="object-fit: contain;">
            </td>
            <td style="max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${producto.nombre}</td>
            <td>${producto.precio}</td>
            <td>${producto.cantidad}</td>
            <td>
                <a href="#">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                        <path class="eliminar-producto" data-id="${producto.id}" d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                    </svg>
                </a>
            </td>
        `;
        contenedorCarrito.appendChild(row);
    });
} 

function eliminarProducto(e) {
    e.preventDefault();
    if (e.target.closest('.eliminar-producto')) {
        const productoId = e.target.getAttribute('data-id');
        productosCarrito = productosCarrito.filter(producto => producto.id !== productoId);
        pintarCarrito();
    }
}