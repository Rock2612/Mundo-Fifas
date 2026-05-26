/* PERSONALIZADOS (LOCALSTORAGE)*/
let personalizados = JSON.parse(localStorage.getItem("personalizados")) || [];
let tempPersonalizado = {};
/* DATA (JSON) */
let retros = [];
let actuales = [];
let firmado = [];
/* CONTENEDOR */
const app = document.getElementById("app");
/*CARGAR JSON */
async function loadProducts() {
    try {
        const res = await fetch("/src/data/products.json");
        const data = await res.json();

        retro = data.retros;
        actuales = data.actuales;
        firmado = data.firmado;

        render(); 
    } catch (error) {
        console.error("Error cargando JSON:", error);
        app.innerHTML = `<p class="text-danger">Error cargando productos</p>`;
    }
}
loadProducts();
/*RENDER*/
function render() {
    app.innerHTML = `
<section class="hero-banner">
    <div class="hero-overlay"></div>
    <div class="hero-content text-center">
        <div class="hero-title">
        <h1> JERSEYS </h1>
        </div>
        <p>Retro • Actuales • Firmados • Personalizados</p>
    </div>
</section>

<!-- RETRO -->
<div class="container mt-3">
    <h2 class="section-title mb-2">Jerseys Retro</h2>
    <div class="row g-3">
        ${retro.map(jersey => card(jersey, "retro")).join("")}
    </div>
</div>

<!-- ACTUALES -->
<div class="container mt-5">
    <h2 class="section-title mb-2">Jerseys Actuales</h2>
    <div class="row g-3">
        ${actuales.map(jersey => card(jersey, "actuales")).join("")}
    </div>
</div>

<!-- FIRMADOS -->
<div class="container mt-5">
    <h2 class="section-title mb-2">Jerseys Firmados</h2>
    <div class="row g-3">
        ${firmado.map(jersey => card(jersey, "firmados")).join("")}
    </div>
</div>

<!-- PERSONALIZADOS -->
<div class="container mt-5 mb-5">
    <h2 class="section-title mb-2">Personaliza tu jersey</h2>

    <div class="row g-4">

        <div class="col-12 col-lg-6">
            <div class="card shadow p-3">

                <h5 class="mb-3">Crea tu diseño</h5>

                <input id="team" class="form-control mb-2" placeholder="Selección / Equipo">
                <input id="name" class="form-control mb-2" placeholder="Nombre en la espalda">
                <input id="number" class="form-control mb-2" placeholder="Número">

                <button class="btn btn-dark w-100" onclick="previewJersey()">
                    Vista previa
                </button>

            </div>
        </div>

        <div class="col-12 col-lg-6">
            <div class="card shadow p-3">

                <h5>Vista previa</h5>

                <div id="previewBox" class="text-center text-muted">
                    Aquí verás tu jersey
                </div>

                <button class="btn btn-success w-100 mt-3" onclick="saveJersey()">
                    Confirmar y guardar
                </button>

            </div>
        </div>

    </div>
</div>

<!-- MODAL -->
<div class="modal fade" id="jerseyModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title" id="modalTitle"></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body">
                <img id="modalImg" class="img-fluid mb-3" />
                <p id="modalDesc"></p>
                <h5 id="modalPrice"></h5>
            </div>

        </div>
    </div>
</div>
`;
}

/* CARD COMPONENT */
function card(jersey, tipo) {
    return `
    <div class="col-12 col-sm-6 col-md-4 col-lg-3">
        <div class="card h-100 shadow">
            <img src="${jersey.imagen}" class="card-img-top"
            style="height:250px; object-fit:cover;">

            <div class="card-body d-flex flex-column justify-content-between">

                <div>
                    <h5>${jersey.nombre}</h5>
                    <p>${jersey.precio}</p>
                </div>

                <div class="d-grid gap-2 mt-3">

                    <button class="btn btn-dark btn-sm"
                        onclick="openModal('${jersey.id}', '${tipo}')">
                        👁️ Ver más
                    </button>

                    <button class="btn btn-outline-dark btn-sm">
                        🛒 Agregar al carrito
                    </button>

                </div>

            </div>
        </div>
    </div>
    `;
}

/* MODAL */
function openModal(id, tipo) {

    const data =
        tipo === "retro" ? retro :
        tipo === "actuales" ? actuales :
        firmado;

    const jersey = data.find(item => item.id == id);

    document.getElementById("modalTitle").innerText = jersey.nombre;
    document.getElementById("modalImg").src = jersey.imagen;
    document.getElementById("modalDesc").innerText = jersey.descripcion;
    document.getElementById("modalPrice").innerText = jersey.precio;

    new bootstrap.Modal(document.getElementById("jerseyModal")).show();
}

/* PERSONALIZACIÓN */
function previewJersey() {

    const team = document.getElementById("team").value.trim();
    const name = document.getElementById("name").value.trim();
    const number = document.getElementById("number").value.trim();

    if (!team || !name || !number) {
        document.getElementById("previewBox").innerHTML =
            `<p class="text-danger">⚠️ Completa los campos obligatorios</p>`;
        return;
    }

    tempPersonalizado = { team, name, number };

    document.getElementById("previewBox").innerHTML = `
        <div class="card p-3 shadow border-0">
            <h5>📋 Confirmar datos</h5>
            <p><strong>Equipo:</strong> ${team}</p>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Número:</strong> ${number}</p>
        </div>
    `;
}

/* GUARDAR */
function saveJersey() {

    if (!tempPersonalizado.team) {
        alert("Primero genera la vista previa");
        return;
    }

    personalizados.push({
        ...tempPersonalizado,
        id: Date.now()
    });

    localStorage.setItem("personalizados", JSON.stringify(personalizados));

    alert("✔ Guardado correctamente");

    tempPersonalizado = {};

    document.getElementById("team").value = "";
    document.getElementById("name").value = "";
    document.getElementById("number").value = "";

    document.getElementById("previewBox").innerHTML =
        `<p class="text-muted">Aquí verás tu jersey</p>`;
}