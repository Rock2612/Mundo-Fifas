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