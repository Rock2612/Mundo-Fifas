// Desbloqueo dinámico de métodos de pago
const metodo = document.getElementById('metodo');
const opciones = document.querySelectorAll('.pago-opcion');
metodo.addEventListener('change', () => {
  opciones.forEach(op => op.classList.add('d-none'));
  const seleccion = metodo.value;
  if (seleccion) {
    document.getElementById(`pago${seleccion.charAt(0).toUpperCase() + seleccion.slice(1)}`).classList.remove('d-none');
  }
});

// Precio dinámico
const boletos = document.getElementById('boletos');
const precioTotal = document.getElementById('precioTotal');
const precioUnitario = 2200;
boletos.addEventListener('input', () => {
  const cantidad = parseInt(boletos.value) || 1;
  precioTotal.textContent = `$${cantidad * precioUnitario} MXN`;
});

// Validación de tarjeta
function validarTarjeta() {
  const numTarjeta = document.getElementById('numTarjeta');
  const expTarjeta = document.getElementById('expTarjeta');
  const cvvTarjeta = document.getElementById('cvvTarjeta');

  let valido = true;

  // Número de tarjeta: 16 dígitos
  if (!/^[0-9]{16}$/.test(numTarjeta.value.trim())) {
    numTarjeta.classList.add('is-invalid');
    valido = false;
  } else {
    numTarjeta.classList.remove('is-invalid');
  }

  // CVV: 3 dígitos
  if (!/^[0-9]{3}$/.test(cvvTarjeta.value.trim())) {
    cvvTarjeta.classList.add('is-invalid');
    valido = false;
  } else {
    cvvTarjeta.classList.remove('is-invalid');
  }

  // Fecha: formato MM/AA
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expTarjeta.value.trim())) {
    expTarjeta.classList.add('is-invalid');
    valido = false;
  } else {
    expTarjeta.classList.remove('is-invalid');
  }

  return valido;
}

// Mostrar modal al comprar con validación
const form = document.getElementById('purchaseForm');
form.addEventListener('submit', e => {
  e.preventDefault();

  if (metodo.value === "tarjeta") {
    if (!validarTarjeta()) {
      return; // No avanza si la tarjeta no es válida
    }
  }

  document.getElementById('correoConfirm').textContent = document.getElementById('correo').value;
  const modal = new bootstrap.Modal(document.getElementById('successModal'));
  modal.show();
});

// Validación en tiempo real mientras el usuario escribe
['numTarjeta', 'expTarjeta', 'cvvTarjeta'].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener('input', validarTarjeta);
});
