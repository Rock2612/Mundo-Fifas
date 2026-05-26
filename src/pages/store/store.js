// ─── Genera cards y modals desde el JSON ───────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
});

async function loadProducts() {
  try {
   const res = await fetch("/src/pages/store/store.json");
    if (!res.ok) throw new Error("No se pudo cargar retro.json");

    const products = await res.json();

    const grid   = document.getElementById("retro-grid");
    const modals = document.getElementById("retro-modals");

    if (!grid || !modals) {
      console.error("No se encontraron #retro-grid o #retro-modals en el HTML");
      return;
    }

    products.forEach(p => {
      const modalId = `modal${p.id}`;

      // ── CARD ────────────────────────────────────────────────────────────
      const card = document.createElement("div");
      card.className = "retro-card";
      card.dataset.modal = modalId;
      card.innerHTML = `
        <div class="card-img-wrap">
          <img src="${p.img}" alt="${p.name}">
          <div class="card-year">${p.year}</div>
        </div>
        <div class="card-body-inner">
          <div class="card-brand">${p.brand}</div>
          <h2>${p.name}</h2>
          <p class="desc">${p.desc}</p>
          <div class="card-meta">
            <span class="price">${p.price}</span>
            <span class="reviews">${p.stars} <em>${p.reviews}</em></span>
          </div>
          <div class="card-buttons">
            <button class="btn-ver"
              data-bs-toggle="modal"
              data-bs-target="#${modalId}">Ver más</button>
            <button class="btn-cart add-cart"
              data-name="${p.name}">+ Carrito</button>
          </div>
        </div>`;
      grid.appendChild(card);

      // ── MODAL ───────────────────────────────────────────────────────────
      const detailsHTML = p.details
        .map(d => `<li><span>${d.label}</span><strong>${d.value}</strong></li>`)
        .join("");

      const modal = document.createElement("div");
      modal.className = "modal fade";
      modal.id = modalId;
      modal.tabIndex = -1;
      modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <div>
                <div class="modal-brand">${p.brand} · ${p.year}</div>
                <h5 class="modal-title">${p.brand} ${p.name}</h5>
              </div>
              <button class="btn-close-custom" data-bs-dismiss="modal">✕</button>
            </div>
            <div class="modal-body">
              <div class="modal-img-col">
                <img src="${p.img}" class="modal-img" alt="${p.name}">
              </div>
              <div class="modal-info-col">
                <p>${p.modalDesc}</p>
                <ul class="retro-details">${detailsHTML}</ul>
                <div class="modal-price-row">
                  <span class="modal-price">${p.price}</span>
                  <span class="modal-reviews">${p.stars} ${p.reviews} reseñas</span>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn-modal-close" data-bs-dismiss="modal">Cerrar</button>
              <button class="btn-modal-cart add-cart"
                data-name="${p.name}"
                data-bs-dismiss="modal">Agregar al carrito</button>
            </div>
          </div>
        </div>`;
      modals.appendChild(modal);
    });

    initCart();

  } catch (err) {
    console.error("Error al cargar productos:", err);
  }
}

// ─── Lógica del carrito ────────────────────────────────────────────────────

// function initCart() {
//   let cartCount = 0;

//   document.addEventListener("click", e => {
//     if (!e.target.classList.contains("add-cart")) return;
//     cartCount++;
//     document.getElementById("cartNum").textContent = cartCount;

//     const alert = document.getElementById("cartAlert");
//     alert.classList.add("show");
//     setTimeout(() => alert.classList.remove("show"), 2500);
//   });
// }