const events = [
  {
    id: "brasil-mexico",
    title: "Brasil vs Mexico",
    venue: "Estadio Azteca",
    date: "15 junio",
    city: "Ciudad de Mexico",
    price: 2200,
    image: "/src/assets/img/eventos/bzVsMx.jpg",
    purchaseImage: "/src/assets/img/eventos/edson-vini.jpg",
    desc: "Un encuentro de alto ritmo para vivir la energia mundialista desde la tribuna.",
  },
  {
    id: "argentina-alemania",
    title: "Argentina vs Alemania",
    venue: "Estadio BBVA",
    date: "18 junio",
    city: "Monterrey",
    price: 2450,
    image: "/src/assets/img/eventos/argvsAle.jpg",
    purchaseImage: "/src/assets/img/eventos/messi.jpg",
    desc: "Dos selecciones historicas en una sede pensada para una experiencia premium.",
  },
  {
    id: "brasil-argentina",
    title: "Brasil vs Argentina",
    venue: "Estadio Metropolitano",
    date: "22 junio",
    city: "Guadalajara",
    price: 2800,
    image: "/src/assets/img/eventos/bzArg.jpg",
    purchaseImage: "/src/assets/img/eventos/raphina.jpg",
    desc: "Rivalidad continental, ambiente intenso y boletos con disponibilidad limitada.",
  },
  {
    id: "alemania-francia",
    title: "Alemania vs Francia",
    venue: "Estadio Azteca",
    date: "25 junio",
    city: "Ciudad de Mexico",
    price: 2350,
    image: "/src/assets/img/eventos/laFrance.webp",
    purchaseImage: "/src/assets/img/eventos/mbappe.jpeg",
    desc: "Una noche europea en Mexico con acceso para fans y coleccionistas.",
  },
  {
    id: "espana-italia",
    title: "Espana vs Italia",
    venue: "Estadio BBVA",
    date: "28 junio",
    city: "Monterrey",
    price: 2300,
    image: "/src/assets/img/eventos/spainvsIta.jpg",
    purchaseImage: "/src/assets/img/eventos/carvajal.jpg",
    desc: "Estilo, tecnica y ambiente de fase final en una experiencia clara de compra.",
  },
  {
    id: "inglaterra-portugal",
    title: "Inglaterra vs Portugal",
    venue: "Estadio Metropolitano",
    date: "30 junio",
    city: "Guadalajara",
    price: 2500,
    image: "/src/assets/img/eventos/portugal.jpg",
    purchaseImage: "/src/assets/img/eventos/ronaldo.webp",
    desc: "Partido de alta demanda con boletos digitales enviados a tu correo.",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  renderEventsPage();
  initPurchasePage();
});

function renderEventsPage() {
  const grid = document.getElementById("eventsGrid");
  const modals = document.getElementById("eventsModals");

  if (!grid || !modals) {
    return;
  }

  grid.innerHTML = events.map(buildEventCard).join("");
  modals.innerHTML = events.map(buildEventModal).join("");
}

function buildEventCard(event) {
  return `
    <div class="col-md-6 col-xl-4">
      <article class="event-card">
        <img src="${escapeHtml(event.image)}" alt="${escapeHtml(event.title)}">
        <div class="event-card-body">
          <span class="section-kicker">${escapeHtml(event.city)}</span>
          <h3>${escapeHtml(event.title)}</h3>
          <p>${escapeHtml(event.venue)} - ${escapeHtml(event.date)}</p>
          <div class="event-card-actions">
            <button class="btn btn-outline-dark" data-bs-toggle="modal" data-bs-target="#modal-${escapeHtml(event.id)}">Ver detalle</button>
            <a class="btn btn-accent" href="${getPurchaseUrl(event)}">Comprar</a>
          </div>
        </div>
      </article>
    </div>
  `;
}

function buildEventModal(event) {
  const modalImage = event.purchaseImage || event.image;

  return `
    <div class="modal fade" id="modal-${escapeHtml(event.id)}" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content store-modal">
          <div class="modal-header">
            <div>
              <div class="modal-brand">${escapeHtml(event.city)} - ${escapeHtml(event.date)}</div>
              <h5 class="modal-title">${escapeHtml(event.title)}</h5>
            </div>
            <button type="button" class="btn-close-custom" data-bs-dismiss="modal" aria-label="Cerrar">x</button>
          </div>
          <div class="modal-body">
            <div class="modal-img-col">
              <img src="${escapeHtml(modalImage)}" class="modal-img" alt="Jugadores de ${escapeHtml(event.title)}">
            </div>
            <div class="modal-info-col">
              <p>${escapeHtml(event.desc)}</p>
              <ul class="retro-details">
                <li><span>Sede</span><strong>${escapeHtml(event.venue)}</strong></li>
                <li><span>Fecha</span><strong>${escapeHtml(event.date)}</strong></li>
                <li><span>Ciudad</span><strong>${escapeHtml(event.city)}</strong></li>
              </ul>
              <div class="modal-price-row">
                <span class="modal-price">${formatPrice(event.price)}</span>
                <span class="modal-reviews">Boleto digital</span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-modal-close" data-bs-dismiss="modal">Cerrar</button>
            <a class="btn-modal-cart text-center" href="${getPurchaseUrl(event)}">Comprar boletos</a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function initPurchasePage() {
  const form = document.getElementById("purchaseForm");

  if (!form) {
    return;
  }

  const selectedEvent = getSelectedEvent();
  const summary = document.querySelector(".ticket-summary");
  const boletos = document.getElementById("boletos");
  const precioTotal = document.getElementById("precioTotal");
  const metodo = document.getElementById("metodo");
  const pagoTarjeta = document.getElementById("pagoTarjeta");

  document.getElementById("matchTitle").textContent = selectedEvent.title;
  document.getElementById("matchVenue").textContent = `${selectedEvent.venue} - ${selectedEvent.city} - ${selectedEvent.date}`;
  document.getElementById("unitPrice").textContent = formatPrice(selectedEvent.price);

  if (summary) {
    summary.style.setProperty("--ticket-image", `url("${selectedEvent.purchaseImage || selectedEvent.image}")`);
  }

  updateTotal();

  boletos.addEventListener("input", updateTotal);
  metodo.addEventListener("change", () => {
    pagoTarjeta.classList.toggle("d-none", metodo.value !== "tarjeta");
  });

  ["numTarjeta", "expTarjeta", "cvvTarjeta"].forEach((id) => {
    document.getElementById(id).addEventListener("input", validateCard);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showTicketAlert("Completa los campos requeridos.", "warning");
      return;
    }

    if (metodo.value !== "tarjeta" || !validateCard()) {
      showTicketAlert("Revisa los datos de pago.", "warning");
      return;
    }

    document.getElementById("correoConfirm").textContent = document.getElementById("correo").value;
    showTicketAlert("Compra registrada correctamente.", "success");
    bootstrap.Modal.getOrCreateInstance(document.getElementById("successModal")).show();
  });

  function updateTotal() {
    const quantity = Math.min(Math.max(parseInt(boletos.value, 10) || 1, 1), 10);
    boletos.value = quantity;
    precioTotal.textContent = formatPrice(quantity * selectedEvent.price);
  }
}

function validateCard() {
  const fields = {
    numTarjeta: /^[0-9]{16}$/,
    expTarjeta: /^(0[1-9]|1[0-2])\/\d{2}$/,
    cvvTarjeta: /^[0-9]{3}$/,
  };
  let valid = true;

  Object.entries(fields).forEach(([id, pattern]) => {
    const input = document.getElementById(id);
    const matches = pattern.test(input.value.trim());
    input.classList.toggle("is-invalid", !matches);
    valid = valid && matches;
  });

  return valid;
}

function getSelectedEvent() {
  const params = new URLSearchParams(window.location.search);
  return events.find((event) => event.id === params.get("match")) || events[0];
}

function getPurchaseUrl(event) {
  return `/src/pages/eventos/compra.html?match=${encodeURIComponent(event.id)}`;
}

function showTicketAlert(message, type) {
  if (window.showSiteAlert) {
    window.showSiteAlert(message, type);
  }
}

function formatPrice(value) {
  return `$${Number(value).toLocaleString("es-MX")} MXN`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
