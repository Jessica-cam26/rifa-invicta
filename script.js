document.addEventListener('DOMContentLoaded', () => {
    const numbersGrid = document.getElementById('numbersGrid');
    const selectedNumDisplay = document.getElementById('selectedNumDisplay');
    const buyerNameInput = document.getElementById('buyerNameInput');
    const buyerPhoneInput = document.getElementById('buyerPhoneInput');
    const btnConfirm = document.getElementById('btnConfirm');
    const btnClearData = document.getElementById('btnClearData');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');

    let selectedNumber = null;
    let isAdminMode = false; 
    let tickets = {};

    const FIREBASE_URL = 'https://rifa-invicta-3d07c-default-rtdb.firebaseio.com/tickets.json';
    const WHATSAPP_DESTINO = '573152365675'; 

    if (btnClearData) { btnClearData.style.display = 'none'; }

    // Función para alertas profesionales en el centro de la pantalla
    function mostrarAlertaProfesional(titulo, mensaje, esExito = false) {
        const overlay = document.createElement('div');
        overlay.className = 'custom-modal-overlay';
        
        // Estilos rápidos por código para asegurar que se centre en cualquier pantalla
        overlay.style.position = 'fixed';
        overlay.style.top = '0'; overlay.style.left = '0';
        overlay.style.width = '100vw'; overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
        overlay.style.display = 'flex'; overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center'; overlay.style.zIndex = '99999';

        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.style.background = '#0b2326';
        modal.style.border = esExito ? '2px solid #1abc9c' : '2px solid #b73434';
        modal.style.borderRadius = '12px'; modal.style.padding = '25px';
        modal.style.textAlign = 'center'; modal.style.maxWidth = '300px';
        modal.style.width = '85%';

        modal.innerHTML = `
            <h3 style="color: ${esExito ? '#1abc9c' : '#b73434'}; margin-top:0; font-size: 1.3rem;">${titulo}</h3>
            <p style="color: #ffffff; font-size: 0.95rem; margin: 15px 0; line-height: 1.4;">${mensaje}</p>
            <button id="btnCerrarModal" style="background: ${esExito ? '#1abc9c' : '#b73434'}; color: #fff; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; width: 100%;">Entendido</button>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        document.getElementById('btnCerrarModal').addEventListener('click', () => {
            overlay.remove();
        });
    }

    // Modo Administrador
    let avatarClickCount = 0;
    const avatar = document.querySelector('.avatar-wrapper');
    if (avatar) {
        avatar.addEventListener('click', () => {
            avatarClickCount++;
            if (avatarClickCount === 5) {
                const password = prompt('Clave de Administrador:');
                if (password === 'admin123') {
                    isAdminMode = true;
                    if (btnClearData) btnClearData.style.display = 'block';
                    mostrarAlertaProfesional('🔓 Modo Admin', '¡Modo Administrador Activado! Ya puedes gestionar el tablero.', true);
                } else {
                    mostrarAlertaProfesional('❌ Error', 'Clave incorrecta.');
                    avatarClickCount = 0;
                    isAdminMode = false;
                }
            }
        });
    }

    function loadTicketsFromFirebase() {
        fetch(FIREBASE_URL)
            .then(response => response.json())
            .then(data => {
                tickets = data || {};
                renderGrid();
            })
            .catch(error => console.error('Error cargando datos de Firebase:', error));
    }

    function updateProgress() {
        const totalNumbers = 100;
        const occupiedNumbers = Object.keys(tickets).length;
        const percentage = Math.round((occupiedNumbers / totalNumbers) * 100);
        if (progressBar && progressPercent) {
            progressBar.style.width = `${percentage}%`;
            progressPercent.textContent = `${percentage}%`;
        }
    }

    function renderGrid() {
        if (!numbersGrid) return;
        numbersGrid.innerHTML = '';

        for (let i = 0; i < 100; i++) {
            const numString = i.toString().padStart(2, '0');
            const cell = document.createElement('div');
            cell.className = 'num-cell';
            cell.textContent = numString;

            if (tickets[numString]) {
                cell.classList.add('occupied');
                cell.style.backgroundColor = '#b73434';
            } else if (selectedNumber === numString) {
                cell.classList.add('selected');
            }

            cell.addEventListener('click', () => {
                if (isAdminMode) {
                    if (tickets[numString]) {
                        if (confirm(`¿Deseas LIBERAR el número ${numString}?`)) {
                            fetch(`https://rifa-invicta-3d07c-default-rtdb.firebaseio.com/tickets/${numString}.json`, { method: 'DELETE' }).then(() => loadTicketsFromFirebase());
                        }
                    } else {
                        const nombreAdmin = prompt(`¿A quién le vas a asignar el número ${numString}?`);
                        if (nombreAdmin) {
                            fetch(`https://rifa-invicta-3d07c-default-rtdb.firebaseio.com/tickets/${numString}.json`, { method: 'PUT', body: JSON.stringify(nombreAdmin) }).then(() => loadTicketsFromFirebase());
                        }
                    }
                    return;
                }

                if (tickets[numString]) {
                    mostrarAlertaProfesional('🚫 No disponible', `El número ${numString} ya está reservado por otra persona.`);
                    return;
                }

                if (selectedNumber === numString) {
                    selectedNumber = null;
                    if (selectedNumDisplay) selectedNumDisplay.value = '--';
                } else {
                    selectedNumber = numString;
                    if (selectedNumDisplay) selectedNumDisplay.value = numString;
                }
                renderGrid();
            });

            numbersGrid.appendChild(cell);
        }
        updateProgress();
    }

    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
            const name = buyerNameInput ? buyerNameInput.value.trim() : '';
            const phone = buyerPhoneInput ? buyerPhoneInput.value.trim() : '';

            if (!name) { mostrarAlertaProfesional('✏️ Dato requerido', 'Por favor, escribe tu nombre completo.'); return; }
            if (!phone) { mostrarAlertaProfesional('✏️ Dato requerido', 'Por favor, escribe tu número de teléfono.'); return; }
            if (!selectedNumber) { mostrarAlertaProfesional('🎰 Selección vacía', 'Por favor, toca un número del tablero para seleccionarlo.'); return; }

            fetch(`https://rifa-invicta-3d07c-default-rtdb.firebaseio.com/tickets/${selectedNumber}.json`)
                .then(res => res.json())
                .then(alreadyBought => {
                    if (alreadyBought) {
                        mostrarAlertaProfesional('⏳ ¡Casi!', `El número ${selectedNumber} se acaba de vender hace un instante. Por favor, elige otro.`, false);
                        loadTicketsFromFirebase();
                        return;
                    }

                    fetch(`https://rifa-invicta-3d07c-default-rtdb.firebaseio.com/tickets/${selectedNumber}.json`, {
                        method: 'PUT',
                        body: JSON.stringify({ nombre: name, telefono: phone })
                    })
                    .then(() => {
                        // Alerta limpia en el centro de la pantalla
                        mostrarAlertaProfesional('🎉 ¡Excelente Selección!', `Tu número ${selectedNumber} ha sido reservado con éxito. Ahora te redirigiremos a WhatsApp para finalizar tu pago.`, true);

                        setTimeout(() => {
                            const mensajeTxt = `¡Hola! 🔥 Acabo de separar la boleta de la rifa en tu página web ⌚.\n\n📌 *Detalles de mi registro:*\n🎫 *Número elegido:* ${selectedNumber}\n👤 *Nombre:* ${name}\n📞 *Celular:* ${phone}\n\nYa quedó bloqueado en el sistema, quedo atento(a) para realizar el pago. 🍀`;
                            const urlWhatsApp = `https://api.whatsapp.com/send?phone=${WHATSAPP_DESTINO}&text=${encodeURIComponent(mensajeTxt)}`;
                            window.open(urlWhatsApp, '_blank');

                            selectedNumber = null;
                            if (selectedNumDisplay) selectedNumDisplay.value = '--';
                            if (buyerNameInput) buyerNameInput.value = '';
                            if (buyerPhoneInput) buyerPhoneInput.value = '';
                            loadTicketsFromFirebase();
                        }, 2500); // 2.5 segundos de espera para que lean el mensaje de éxito antes de abrir WhatsApp
                    });
                });
        });
    }

    if (btnClearData) {
        btnClearData.addEventListener('click', () => {
            if (confirm('⚠️ ¿Borrar TODA la base de datos de Firebase?')) {
                fetch('https://rifa-invicta-3d07c-default-rtdb.firebaseio.com/tickets.json', { method: 'DELETE' }).then(() => {
                    isAdminMode = false;
                    btnClearData.style.display = 'none';
                    avatarClickCount = 0;
                    loadTicketsFromFirebase();
                });
            }
        });
    }

    loadTicketsFromFirebase();
    setInterval(loadTicketsFromFirebase, 10000);
});