// Guarda los jerseys personalizados en localStorage para conservarlos al recargar.
let personalizados = JSON.parse(localStorage.getItem("personalizados")) || [];

// Guarda temporalmente los datos del formulario antes de confirmarlos.
let tempPersonalizado = {};

// Contenedor principal donde se renderiza toda la pagina de jerseys.
const app = document.getElementById("app");

// Cuando el HTML esta listo, se cargan los productos desde el JSON unificado.
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});

// Carga el JSON central y separa los productos por tipo de jersey.
async function loadProducts() {
    try {
        const res = await fetch("/src/data/products.json");

        if (!res.ok) {
            throw new Error("No se pudo cargar products.json");
        }

        const data = await res.json();
        const products = data.products || [];

        render({
            retro: products.filter((product) => product.collection === "jerseys-retro"),
            actuales: products.filter((product) => product.collection === "jerseys-actuales"),
            firmado: products.filter((product) => product.collection === "jerseys-firmados"),
        });
    } catch (error) {
        console.error("Error cargando JSON:", error);
        app.innerHTML = `<p class="text-danger p-4">Error cargando productos</p>`;
    }
}

// Dibuja la pagina completa: hero, colecciones, personalizador y modales.
function render(groups) {
    const allProducts = [...groups.retro, ...groups.actuales, ...groups.firmado];

    app.innerHTML = `
<section class="page-hero jerseys-hero">
    <div class="container page-hero-content">
        <span class="label-pill">Jerseys</span>
        <h1>Retro, actuales y firmados.</h1>
        <p>Selecciona piezas de coleccion, camisetas recientes o personaliza un jersey con tu equipo, nombre y numero.</p>
    </div>
</section>

${collectionSection("Coleccion", "Jerseys Retro", groups.retro)}
${collectionSection("Temporada", "Jerseys Actuales", groups.actuales, true)}
${collectionSection("Autografiados", "Jerseys Firmados", groups.firmado)}
${customizerSection()}
<div id="jersey-modals">${allProducts.map((product) => buildStoreModal(product)).join("")}</div>
`;
}

// Crea una seccion de coleccion con titulo y cards.
// El parametro soft alterna el fondo claro para separar visualmente secciones.
function collectionSection(kicker, title, products, soft = false) {
    return `
<section class="collection-block ${soft ? "soft-bg" : ""}">
    <div class="container">
        <div class="collection-heading">
            <span class="label-pill label-light">${kicker}</span>
            <h2 class="section-title mb-0">${title}</h2>
        </div>
        <div class="row g-3">
            ${products.map((product) => card(product)).join("")}
        </div>
    </div>
</section>`;
}

// Genera la seccion donde el usuario puede capturar datos para un jersey personalizado.
function customizerSection() {
    return `
<section class="collection-block soft-bg">
    <div class="container">
        <div class="collection-heading">
            <span class="label-pill label-light">A medida</span>
            <h2 class="section-title mb-0">Personaliza tu jersey</h2>
        </div>
        <div class="row g-4">
            <div class="col-12 col-lg-6">
                <div class="card customizer-card">
                    <h5 class="mb-3">Crea tu diseno</h5>
                    <input id="team" class="form-control mb-2" placeholder="Seleccion / Equipo">
                    <input id="name" class="form-control mb-2" placeholder="Nombre en la espalda">
                    <input id="number" class="form-control mb-2" placeholder="Numero">
                    <button class="btn btn-dark w-100" onclick="previewJersey()">Vista previa</button>
                </div>
            </div>
            <div class="col-12 col-lg-6">
                <div class="card customizer-card">
                    <h5 class="mb-3">Vista previa</h5>
                    <div id="previewBox" class="text-center">Aqui veras tu jersey</div>
                    <button class="btn btn-accent w-100 mt-3" onclick="saveJersey()">Confirmar y guardar</button>
                </div>
            </div>
        </div>
    </div>
</section>`;
}

// Crea una card de jersey con botones para abrir modal y agregar al carrito.
function card(product) {
    const modalId = getModalId(product.id);

    return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100">
            <img src="${escapeHtml(product.img)}" class="card-img-top" alt="${escapeHtml(product.name)}">
            <div class="card-body d-flex flex-column justify-content-between">
                <div>
                    <h5>${escapeHtml(product.name)}</h5>
                    <p>${escapeHtml(product.price)}</p>
                </div>
                <div class="d-grid gap-2 mt-3">
                    <button class="btn btn-dark btn-sm" data-bs-toggle="modal" data-bs-target="#${modalId}">Ver mas</button>
                    <button class="btn btn-outline-dark btn-sm add-cart" data-product-id="${escapeHtml(product.id)}" data-name="${escapeHtml(product.name)}">Agregar al carrito</button>
                </div>
            </div>
        </div>
    </div>`;
}

// Construye el modal de producto con el mismo formato que la tienda.
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

// Lee los campos del formulario y muestra una vista previa antes de guardar.
function previewJersey() {
    const team = document.getElementById("team").value.trim();
    const name = document.getElementById("name").value.trim();
    const number = document.getElementById("number").value.trim();

    if (!team || !name || !number) {
        document.getElementById("previewBox").innerHTML =
            `<p class="text-danger m-0">Completa los campos obligatorios</p>`;
        return;
    }

    tempPersonalizado = { team, name, number };

    document.getElementById("previewBox").innerHTML = `
        <div>
            <h5>Confirmar datos</h5>
            <p><strong>Equipo:</strong> ${escapeHtml(team)}</p>
            <p><strong>Nombre:</strong> ${escapeHtml(name)}</p>
            <p><strong>Numero:</strong> ${escapeHtml(number)}</p>
        </div>`;
}

// Guarda el jersey personalizado en localStorage y limpia el formulario.
function saveJersey() {
    if (!tempPersonalizado.team) {
        alert("Primero genera la vista previa");
        return;
    }

    personalizados.push({
        ...tempPersonalizado,
        id: Date.now(),
    });

    localStorage.setItem("personalizados", JSON.stringify(personalizados));
    alert("Guardado correctamente");

    tempPersonalizado = {};
    document.getElementById("team").value = "";
    document.getElementById("name").value = "";
    document.getElementById("number").value = "";
    document.getElementById("previewBox").innerHTML = `<p class="text-muted m-0">Aqui veras tu jersey</p>`;
}

// Convierte cualquier id en un valor seguro para usarlo como id de modal.
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
