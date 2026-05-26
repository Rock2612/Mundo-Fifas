let personalizados = JSON.parse(localStorage.getItem("personalizados")) || [];
let tempPersonalizado = {};
let retro = [];
let actuales = [];
let firmado = [];

const app = document.getElementById("app");

async function loadProducts() {
    try {
        const res = await fetch("/src/data/products.json");
        const data = await res.json();

        retro = data.retros || [];
        actuales = data.actuales || [];
        firmado = data.firmado || [];

        render();
    } catch (error) {
        console.error("Error cargando JSON:", error);
        app.innerHTML = `<p class="text-danger p-4">Error cargando productos</p>`;
    }
}

loadProducts();

function render() {
    app.innerHTML = `
<section class="page-hero jerseys-hero">
    <div class="container page-hero-content">
        <span class="label-pill">Jerseys</span>
        <h1>Retro, actuales y firmados.</h1>
        <p>Selecciona piezas de coleccion, camisetas recientes o personaliza un jersey con tu equipo, nombre y numero.</p>
    </div>
</section>

${collectionSection("Coleccion", "Jerseys Retro", retro, "retro")}
${collectionSection("Temporada", "Jerseys Actuales", actuales, "actuales", true)}
${collectionSection("Autografiados", "Jerseys Firmados", firmado, "firmados")}
${customizerSection()}

<div class="modal fade" id="jerseyModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle"></h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <img id="modalImg" class="img-fluid mb-3" alt="">
                <p id="modalDesc"></p>
                <h5 id="modalPrice"></h5>
            </div>
        </div>
    </div>
</div>
`;
}

function collectionSection(kicker, title, products, type, soft = false) {
    return `
<section class="collection-block ${soft ? "soft-bg" : ""}">
    <div class="container">
        <div class="collection-heading">
            <span class="label-pill label-light">${kicker}</span>
            <h2 class="section-title mb-0">${title}</h2>
        </div>
        <div class="row g-3">
            ${products.map((jersey) => card(jersey, type)).join("")}
        </div>
    </div>
</section>
`;
}

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
</section>
`;
}

function card(jersey, tipo) {
    return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100">
            <img src="${jersey.imagen}" class="card-img-top" alt="${jersey.nombre}">
            <div class="card-body d-flex flex-column justify-content-between">
                <div>
                    <h5>${jersey.nombre}</h5>
                    <p>${jersey.precio}</p>
                </div>
                <div class="d-grid gap-2 mt-3">
                    <button class="btn btn-dark btn-sm" onclick="openModal('${jersey.id}', '${tipo}')">Ver mas</button>
                    <button class="btn btn-outline-dark btn-sm">Agregar al carrito</button>
                </div>
            </div>
        </div>
    </div>
    `;
}

function openModal(id, tipo) {
    const data =
        tipo === "retro" ? retro :
        tipo === "actuales" ? actuales :
        firmado;

    const jersey = data.find((item) => item.id == id);

    document.getElementById("modalTitle").innerText = jersey.nombre;
    document.getElementById("modalImg").src = jersey.imagen;
    document.getElementById("modalImg").alt = jersey.nombre;
    document.getElementById("modalDesc").innerText = jersey.descripcion;
    document.getElementById("modalPrice").innerText = jersey.precio;

    new bootstrap.Modal(document.getElementById("jerseyModal")).show();
}

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
            <p><strong>Equipo:</strong> ${team}</p>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Numero:</strong> ${number}</p>
        </div>
    `;
}

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
