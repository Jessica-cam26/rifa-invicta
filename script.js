const LIMITE_NUMEROS = 100;
let baseDatosRifa = {};

// Intentar cargar de forma segura del LocalStorage
try {
    const datosGuardados = localStorage.getItem('rifary_invicta_store');
    if (datosGuardados) {
        baseDatosRifa = JSON.parse(datosGuardados);
    }
} catch (e) {
    console.error("Error cargando LocalStorage", e);
}

document.addEventListener('DOMContentLoaded', () => {
    dibujarCeldas();
    calcularMetricasSistema();
});

function dibujarCeldas() {
    const contenedor = document.getElementById('gridTablero');
    if (!contenedor) return; 
    
    contenedor.innerHTML = '';

    for (let i = 0; i < LIMITE_NUMEROS; i++) {
        const stringNum = i.toString().padStart(2, '0');
        
        const divCelda = document.createElement('div');
        divCelda.classList.add('num-cell');
        divCelda.innerText = stringNum;
        divCelda.setAttribute('data-id', stringNum);

        if (baseDatosRifa[stringNum]) {
            divCelda.classList.add('checked');
            divCelda.title = `Reservado por: ${baseDatosRifa[stringNum]}`;
            // Si ya está comprado, al hacerle clic podemos consultarlo o enviarlo
            divCelda.addEventListener('click', () => consultarCeldaOcupada(stringNum));
        } else {
            divCelda.addEventListener('click', () => gestionarClicCelda(stringNum));
        }

        contenedor.appendChild(divCelda);
    }
}

function gestionarClicCelda(num) {
    document.querySelectorAll('.num-cell').forEach(c => c.classList.remove('selected'));
    
    const celdaMarcada = document.querySelector(`[data-id="${num}"]`);
    if (celdaMarcada) celdaMarcada.classList.add('selected');

    document.getElementById('selectedNumDisplay').value = num;
    
    const inputNombre = document.getElementById('buyerNameInput');
    inputNombre.disabled = false;
    inputNombre.value = '';
    inputNombre.placeholder = `Escribe el nombre para el número ${num}...`;
    inputNombre.focus();

    document.getElementById('btnSubmit').disabled = false;
    document.getElementById('btnWhatsApp').disabled = true; // Desactivado hasta que se confirme
}

function consultarCeldaOcupada(num) {
    document.querySelectorAll('.num-cell').forEach(c => c.classList.remove('selected'));
    
    const celdaMarcada = document.querySelector(`[data-id="${num}"]`);
    if (celdaMarcada) celdaMarcada.classList.add('selected');

    document.getElementById('selectedNumDisplay').value = num;
    
    const inputNombre = document.getElementById('buyerNameInput');
    inputNombre.disabled = true;
    inputNombre.value = baseDatosRifa[num];

    document.getElementById('btnSubmit').disabled = true;
    document.getElementById('btnWhatsApp').disabled = false; // Activa WhatsApp para reenviar si es necesario
}

function confirmarBoleto() {
    const numeroElegido = document.getElementById('selectedNumDisplay').value;
    const nombrePersona = document.getElementById('buyerNameInput').value.trim();

    if (!nombrePersona) {
        alert("Por favor, introduce el nombre del comprador.");
        return;
    }

    baseDatosRifa[numeroElegido] = nombrePersona;
    localStorage.setItem('rifary_invicta_store', JSON.stringify(baseDatosRifa));

    dibujarCeldas();
    calcularMetricasSistema();
    
    // Activar botón de WhatsApp inmediatamente después de guardar para enviarlo una vez
    document.getElementById('btnWhatsApp').disabled = false;
    document.getElementById('btnSubmit').disabled = true;
    document.getElementById('buyerNameInput').disabled = true;
}

function enviarWhatsApp() {
    const numero = document.getElementById('selectedNumDisplay').value;
    const nombre = document.getElementById('buyerNameInput').value;

    if (numero === '--' || !nombre) {
        alert("Selecciona un número válido con comprador primero.");
        return;
    }

    // Mensaje personalizado y formateado para WhatsApp
    const mensaje = `¡Hola *${nombre}*! 👋 Tu número para la Rifa del *Reloj Premium Invicta* ha sido reservado con éxito. 🎉\n\n📌 *Número elegido:* ${numero}\n💰 *Valor:* $10.000\n\n¡Muchas gracias por participar y buena suerte! 🍀`;
    
    // Crear el enlace universal de WhatsApp
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensaje)}`;
    
    // Abrir en una pestaña nueva
    window.open(url, '_blank');
}

function calcularMetricasSistema() {
    const bar = document.getElementById('progressBar');
    const txt = document.getElementById('progressText');
    if (!bar || !txt) return;

    const totalComprados = Object.keys(baseDatosRifa).length;
    const ratioPorcentaje = Math.round((totalComprados / LIMITE_NUMEROS) * 100);

    bar.style.width = `${ratioPorcentaje}%`;
    txt.innerText = `${ratioPorcentaje}%`;
}

function reiniciarRifa() {
    if (confirm("¿Vaciar base de datos?")) {
        baseDatosRifa = {};
        localStorage.removeItem('rifary_invicta_store');
        document.getElementById('selectedNumDisplay').value = '--';
        document.getElementById('buyerNameInput').value = '';
        document.getElementById('buyerNameInput').disabled = true;
        document.getElementById('btnWhatsApp').disabled = true;
        document.getElementById('btnSubmit').disabled = true;
        dibujarCeldas();
        calcularMetricasSistema();
    }
}   