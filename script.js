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

    // Configuración de tu Firebase en tiempo real
    const FIREBASE_URL = 'https://rifa-invicta-3d07c-default-rtdb.firebaseio.com/tickets.json';
    const WHATSAPP_DESTINO = '573152365675'; 

    if (btnClearData) {
        btnClearData.style.display = 'none'; 
    }

    // Modo Administrador (5 clics en avatar de Brandon)
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
                    alert('🔓 ¡Modo Administrador Activado!\n\nComo administradora, puedes hacer clic en cualquier número para gestionarlo directamente en la base de datos.');
                } else {
                    alert('Clave incorrecta.');
                    avatarClickCount = 0;
                    isAdminMode = false;
                }
            }
        });
    }

    // Función para consultar la base de datos en tiempo real de forma automática
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
                cell.style.cursor = 'pointer';
            } 
            else if (selectedNumber === numString) {
                cell.classList.add('selected');
            }

            cell.addEventListener('click', () => {
                // Lógica del modo administrador (Guardar / Eliminar directamente en la nube)
                if (isAdminMode) {
                    if (tickets[numString]) {
                        if (confirm(`¿Deseas LIBERAR el número ${numString} de la nube?`)) {
                            fetch(`https://rifa-invicta-3d07c-default-rtdb.firebaseio.com/tickets/${numString}.json`, {
                                method: 'DELETE'
                            }).then(() => loadTicketsFromFirebase());
                        }
                    } else {
                        const nombreAdmin = prompt(`¿A quién le vas a asignar el número ${numString}?`);
                        if (nombreAdmin) {
                            fetch(`https://rifa-invicta-3d07c-default-rtdb.firebaseio.com/tickets/${numString}.json`, {
                                method: 'PUT',
                                body: JSON.stringify(nombreAdmin)
                            }).then(() => loadTicketsFromFirebase());
                        }
                    }
                    return;
                }

                // Lógica del cliente normal
                if (tickets[numString]) {
                    alert(`🚫 El número ${numString} ya está reservado por alguien más.`);
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

    // Confirmar Selección (Guarda de forma segura en Firebase y notifica por WhatsApp)
    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
            const name = buyerNameInput ? buyerNameInput.value.trim() : '';
            const phone = buyerPhoneInput ? buyerPhoneInput.value.trim() : '';

            if (!name) { alert('Por favor, escribe tu nombre completo.'); return; }
            if (!phone) { alert('Por favor, escribe tu número de teléfono.'); return; }
            if (!selectedNumber) { alert('Por favor, selecciona un número.'); return; }

            // Verificación de último segundo: Revisar si otra persona lo ganó mientras tanto
            fetch(`https://rifa-invicta-3d07c-default-rtdb.firebaseio.com/tickets/${selectedNumber}.json`)
                .then(res => res.json())
                .then(alreadyBought => {
                    if (alreadyBought) {
                        alert(`⚠️ ¡Qué mala suerte! Alguien acaba de reservar el número ${selectedNumber} hace unos segundos. Por favor selecciona otro.`);
                        loadTicketsFromFirebase();
                        return;
                    }

                    // Guardar el número asignado en Firebase de manera inmediata
                    fetch(`https://rifa-invicta-3d07c-default-rtdb.firebaseio.com/tickets/${selectedNumber}.json`, {
                        method: 'PUT',
                        body: JSON.stringify({ nombre: name, telefono: phone })
                    })
                    .then(() => {
                        // Crear mensaje de WhatsApp informativo
                        const mensajeTxt = `¡Hola! 🔥 Acabo de separar la boleta de la rifa en tu página web ⌚.\n\n📌 *Detalles de mi registro:*\n🎫 *Número elegido:* ${selectedNumber}\n👤 *Nombre:* ${name}\n📞 *Celular:* ${phone}\n\nYa quedó bloqueado en el sistema, quedo atento(a) para realizar el pago. 🍀`;
                        const urlWhatsApp = `https://api.whatsapp.com/send?phone=${WHATSAPP_DESTINO}&text=${encodeURIComponent(mensajeTxt)}`;
                        
                        // Abrir WhatsApp para concretar el pago
                        window.open(urlWhatsApp, '_blank');

                        // Resetear campos locales e清空
                        selectedNumber = null;
                        if (selectedNumDisplay) selectedNumDisplay.value = '--';
                        if (buyerNameInput) buyerNameInput.value = '';
                        if (buyerPhoneInput) buyerPhoneInput.value = '';
                        
                        // Recargar el tablero de inmediato
                        loadTicketsFromFirebase();
                    });
                });
        });
    }

    // Botón borrar todo para el administrador
    if (btnClearData) {
        btnClearData.addEventListener('click', () => {
            if (confirm('⚠️ ¿Estás segura de borrar TODA la base de datos en la nube de Firebase? Esta acción no se puede deshacer.')) {
                fetch('https://rifa-invicta-3d07c-default-rtdb.firebaseio.com/tickets.json', {
                    method: 'DELETE'
                }).then(() => {
                    isAdminMode = false;
                    btnClearData.style.display = 'none';
                    avatarClickCount = 0;
                    loadTicketsFromFirebase();
                });
            }
        });
    }

    // Primera carga al abrir la página
    loadTicketsFromFirebase();
    
    // Auto-actualizar el tablero cada 10 segundos por si hay más personas comprando al mismo tiempo
    setInterval(loadTicketsFromFirebase, 10000);
});