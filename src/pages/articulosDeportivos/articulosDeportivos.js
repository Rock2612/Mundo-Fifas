document.addEventListener("DOMContentLoaded", () => {
    cargarReliquiasMundiales();
});

// Mapa de imágenes locales para cuando las del products.json vengan en blanco
const mapaImagenesOriginales = {
    41: "../../assets/img/rodrigo/panini.jpg",
    42: "../../assets/img/rodrigo/guantes.jpg",
    43: "../../assets/img/rodrigo/bufanda.jpg",
    44: "../../assets/img/rodrigo/trionda.jpg",
    45: "../../assets/img/rodrigo/paq.jpg",
    46: "../../assets/img/rodrigo/nike.jpg",
    47: "../../assets/img/rodrigo/mochila.jpg",
    48: "../../assets/img/rodrigo/cono.jpg"
    
    
};

async function cargarReliquiasMundiales() {
    const contenedor = document.querySelector("#contenedor-mundiales");
    if (!contenedor) return;

    try {
        // Petición al JSON global compartido
        const response = await fetch("../../data/products.json");
        
        if (!response.ok) {
            throw new Error("No se pudo conectar con el catálogo central.");
        }

        const data = await response.json();
        const articulos = Array.isArray(data.articulos) ? data.articulos : [];

        if (!articulos.length) {
            contenedor.innerHTML = `<div class="col-12 text-center"><p class="text-muted">No hay reliquias en inventario actualmente.</p></div>`;
            return;
        }

        contenedor.innerHTML = "";

        // Mostramos tus 8 reliquias insignias alineadas al JSON
        const reliquiasAMostrar = articulos.slice(0, 8);

        reliquiasAMostrar.forEach((producto) => {
            // Asigna la imagen guardada en tu mapa local si el JSON viene vacío
            let rutaImg = producto.img ? `../../${producto.img}` : (mapaImagenesOriginales[producto.id] || "../../assets/img/balon-jabulani.jpg");

            // Evaluamos el 'badgeColor' del JSON para inyectar tus selectores CSS exactos
            let claseBadgeEspecial = "badge-neon"; 
            if (producto.badgeColor === "warning" || producto.badgeColor === "primary") {
                claseBadgeEspecial = "badge-gold";
            } else if (producto.badgeColor === "dark") {
                claseBadgeEspecial = "badge-dark";
            }

            // Renderizado estructural limpio respetando tus nombres de clase CSS
            const tarjetaHTML = `
                <div class="col-sm-6 col-md-4 col-xl-3">
                    <article class="wc-card">
                        <div class="wc-img-container">
                            <span class="wc-tag ${claseBadgeEspecial}">${escapeHtml(producto.badge || "Colección")}</span>
                            <img src="${escapeHtml(rutaImg)}" class="wc-image" alt="${escapeHtml(producto.nombre)}">
                        </div>
                        <div class="wc-body">
                            <span class="wc-edition-text">FIFA OFICIAL</span>
                            <h3 class="wc-title">${escapeHtml(producto.nombre)}</h3>
                            <p class="wc-desc">${escapeHtml(producto.descripcion)}</p>
                            <div class="wc-footer">
                                <span class="wc-price">${formatPrecioMXN(producto.precio)}</span>
                                <button class="btn btn-add-cart">Añadir</button>
                            </div>
                        </div>
                    </article>
                </div>
            `;
            contenedor.innerHTML += tarjetaHTML;
        });

        // Modifica dinámicamente tu contador de la zona de filtros
        const contadorFiltros = document.querySelector(".results-count");
        if (contadorFiltros) {
            contadorFiltros.textContent = `${reliquiasAMostrar.length} Reliquias disponibles`;
        }

    } catch (error) {
        contenedor.innerHTML = `<div class="col-12 text-center"><p class="text-danger">Hubo un problema al sincronizar los productos de la tienda.</p></div>`;
        console.error("Error en rodrigo.js:", error);
    }
}

// Formateador de moneda MXN sin decimales flotantes (.00)
function formatPrecioMXN(precio) {
    return new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0
    }).format(precio);
}

// Limpiador básico contra ataques XSS en cadenas del JSON
function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}