/* =========================
   PRODUCTOS
========================= */

const productos = [
  {
    nombre: "Balón Oficial 2026",
    descripcion: "Balón edición especial Mundial 2026.",
    precio: 1499,
    categoria: "balones",
    imagen: "../../assets/img/img articulos deportivos/balon.PNG",
  },

  {
    nombre: "Gorra Oficial",
    descripcion: "Gorra edición Mundial FIFA 2026.",
    precio: 1899,
    categoria: "equipamiento",
    imagen: "../../assets/img/img articulos deportivos/gorra.jpg",
  },

  {
    nombre: "Tacos Profesionales",
    descripcion: "Máximo rendimiento en cancha.",
    precio: 2499,
    categoria: "equipamiento",
    imagen: "../../assets/img/img articulos deportivos/tacos.JPG",
  },

  {
    nombre: "Espinilleras",
    descripcion: "Máximo rendimiento en cancha.",
    precio: 699,
    categoria: "equipamiento",
    imagen: "../../assets/img/img articulos deportivos/espinilleras.jpg",
  },

  {
    nombre: "Calcetas",
    descripcion: "Máximo rendimiento en cancha.",
    precio: 399,
    categoria: "equipamiento",
    imagen: "../../assets/img/img articulos deportivos/calcetas.jpg",
  },

  {
    nombre: "Bufanda Mundialista",
    descripcion: "Lleva contigo la pasión del fútbol.",
    precio: 499,
    categoria: "ropa",
    imagen: "../../assets/img/img articulos deportivos/bufanda.jpg",
  },

  {
    nombre: "Bufanda Mundialista",
    descripcion: "Lleva contigo la pasión del fútbol.",
    precio: 499,
    categoria: "ropa",
    imagen: "../../assets/img/img articulos deportivos/bufanda2.jpg",
  },

  {
    nombre: "Bufanda Mundialista",
    descripcion: "Lleva contigo la pasión del fútbol.",
    precio: 499,
    categoria: "ropa",
    imagen: "../../assets/img/img articulos deportivos/bufanda3.JPG",
  },

  {
    nombre: "Bufanda Mundialista",
    descripcion: "Lleva contigo la pasión del fútbol.",
    precio: 499,
    categoria: "ropa",
    imagen: "../../assets/img/img articulos deportivos/bufanda4.JPG",
  },

  {
    nombre: "Balón Oficial 2022",
    descripcion: "Balón edición especial Mundial 2022.",
    precio: 1499,
    categoria: "balones",
    imagen: "../../assets/img/img articulos deportivos/balon2.jpg",
  },

  {
    nombre: "Balón Oficial 2018",
    descripcion: "Balón edición especial Mundial 2018.",
    precio: 1499,
    categoria: "balones",
    imagen: "../../assets/img/img articulos deportivos/balon3.jpg",
  },

  {
    nombre: "Balón Oficial 2014",
    descripcion: "Balón edición especial Mundial 2014.",
    precio: 1499,
    categoria: "balones",
    imagen: "../../assets/img/img articulos deportivos/balon4.jpg",
  },
];

/* =========================
   RENDERIZAR PRODUCTOS
========================= */

const contenedor = document.getElementById("contenedor-productos");

function renderizarProductos(lista) {
  contenedor.innerHTML = "";

  lista.forEach((producto) => {
    contenedor.innerHTML += `
    
    <div class="col-md-6 col-lg-3 producto-item ${producto.categoria}">
    
      <div class="product-card">

        <div class="img-container">
          <img src="${producto.imagen}" alt="${producto.nombre}">
        </div>

        <div class="card-body">

          <h5>${producto.nombre}</h5>

          <p>${producto.descripcion}</p>

          <div class="price">
            $${producto.precio.toLocaleString()} MXN
          </div>

          <button
            class="btn add-cart-btn agregar-carrito"
            data-producto="${producto.nombre}"
            data-precio="${producto.precio}"
          >
            Agregar al carrito
          </button>

        </div>

      </div>

    </div>

    `;
  });

  activarBotonesCarrito();
}

/* =========================
   FILTROS
========================= */

const filterButtons = document.querySelectorAll(".filters button");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    const filter = button.dataset.filter;

    if (filter === "all") {
      renderizarProductos(productos);
    } else {
      const filtrados = productos.filter(
        (producto) => producto.categoria === filter,
      );

      renderizarProductos(filtrados);
    }
  });
});

/* =========================
   CARRITO
========================= */

let carrito = [];

let total = 0;

const listaCarrito = document.getElementById("lista-carrito");

const contadorCarrito = document.getElementById("contador-carrito");

const totalElemento = document.getElementById("total");

function activarBotonesCarrito() {
  const botones = document.querySelectorAll(".agregar-carrito");

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      const producto = boton.dataset.producto;

      const precio = parseInt(boton.dataset.precio);

      carrito.push({
        producto,
        precio,
      });

      total += precio;

      actualizarCarrito();

      boton.innerHTML = "Agregado ✓";

      setTimeout(() => {
        boton.innerHTML = "Agregar al carrito";
      }, 1500);
    });
  });
}

/* =========================
   ACTUALIZAR CARRITO
========================= */

function actualizarCarrito() {
  listaCarrito.innerHTML = "";

  carrito.forEach((item, index) => {
    listaCarrito.innerHTML += `
    
    <li class="list-group-item d-flex justify-content-between align-items-center">

      <div>
        <h6>${item.producto}</h6>
        <small>$${item.precio} MXN</small>
      </div>

      <button
        class="btn btn-danger btn-sm eliminar"
        data-index="${index}"
      >
        <i class="fa-solid fa-trash"></i>
      </button>

    </li>

    `;
  });

  contadorCarrito.textContent = carrito.length;

  totalElemento.textContent = total.toLocaleString();

  activarEliminar();
}

/* =========================
   ELIMINAR PRODUCTO
========================= */

function activarEliminar() {
  const botonesEliminar = document.querySelectorAll(".eliminar");

  botonesEliminar.forEach((boton) => {
    boton.addEventListener("click", () => {
      const index = boton.dataset.index;

      total -= carrito[index].precio;

      carrito.splice(index, 1);

      actualizarCarrito();
    });
  });
}

/* =========================
   BUSCADOR
========================= */

const searchBtn = document.querySelector(".search-btn");

searchBtn.addEventListener("click", () => {
  const texto = prompt("Buscar producto:");

  if (!texto) return;

  const busqueda = texto.toLowerCase();

  const filtrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda),
  );

  renderizarProductos(filtrados);
});

/* =========================
   FINALIZAR COMPRA
========================= */

const checkoutBtn = document.querySelector(".checkout-btn");

checkoutBtn.addEventListener("click", () => {
  if (carrito.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  alert("Gracias por tu compra ⚽🔥");

  carrito = [];

  total = 0;

  actualizarCarrito();
});

/* =========================
   INICIAR
========================= */

renderizarProductos(productos);
