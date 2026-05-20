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
    
    // Cargar los tickets de la memoria
    let tickets = JSON.parse(localStorage.getItem('rifa_tickets')) || {};

    if (btnClearData) {
        btnClearData.style.display = 'none'; 
    }

    // Modo Administrador (5 clics en avatar de Brandon Delgado)
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
                    alert('🔓 ¡Modo Administrador Activado!\n\n1. El botón de borrar todo ya está visible.\n2. Si deseas eliminar UN SOLO NÚMERO, tócalo en el tablero.');
                } else {
                    alert('Clave incorrecta.');
                    avatarClickCount = 0;
                    isAdminMode = false;
                }
            }
        });
    }

    // FUNCIÓN DE PROGRESO CORREGIDA Y REFORZADA
    function updateProgress() {
        const totalNumbers = 100;
        const occupiedNumbers = Object.keys(tickets).length;
        
        // Cálculo matemático directo sobre los tickets reales cargados
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
                cell.title = `Ocupado por: ${tickets[numString]}`;
            } 
            else if (selectedNumber === numString) {
                cell.classList.add('selected');
            }

            cell.addEventListener('click', () => {
                if (tickets[numString]) {
                    if (isAdminMode) {
                        const seguro = confirm(`¿Deseas ELIMINAR el registro del número ${numString}?\nComprador actual: ${tickets[numString]}`);
                        if (seguro) {
                            delete tickets[numString];
                            localStorage.setItem('rifa_tickets', JSON.stringify(tickets));
                            alert(`El número ${numString} ahora está libre nuevamente.`);
                            renderGrid();
                        }
                    } else {
                        alert(`🚫 El número ${numString} ya está reservado por:\n${tickets[numString]}`);
                    }
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
        
        // Ejecutar el progreso siempre al dibujar la grilla
        updateProgress();
    }

    // Botón Confirmar Selección
    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
            const name = buyerNameInput ? buyerNameInput.value.trim() : '';
            const phone = buyerPhoneInput ? buyerPhoneInput.value.trim() : '';

            if (!name) {
                alert('Por favor, escribe tu nombre completo.');
                return;
            }
            if (!phone) {
                alert('Por favor, escribe tu número de teléfono celular.');
                return;
            }
            if (!selectedNumber) {
                alert('Por favor, toca y selecciona un número del tablero.');
                return;
            }

            tickets[selectedNumber] = `${name} (Cel: ${phone})`;
            localStorage.setItem('rifa_tickets', JSON.stringify(tickets));

            alert(`✨ ¡Registro Exitoso! ✨\n\nTu número guardado es el: ${selectedNumber}\n\n¡Muchísima suerte, gracias por la compra de tu boleta! 🍀✨`);

            selectedNumber = null;
            if (selectedNumDisplay) selectedNumDisplay.value = '--';
            if (buyerNameInput) buyerNameInput.value = '';
            if (buyerPhoneInput) buyerPhoneInput.value = '';

            renderGrid();
        });
    }

    if (btnClearData) {
        btnClearData.addEventListener('click', () => {
            if (confirm('⚠️ ¿Estás completamente segura de borrar TODOS los números de la rifa?')) {
                localStorage.removeItem('rifa_tickets');
                tickets = {};
                selectedNumber = null;
                isAdminMode = false;
                if (selectedNumDisplay) selectedNumDisplay.value = '--';
                if (buyerNameInput) buyerNameInput.value = '';
                if (buyerPhoneInput) buyerPhoneInput.value = '';
                btnClearData.style.display = 'none';
                avatarClickCount = 0;
                renderGrid();
            }
        });
    }

    // Inicializar todo el tablero y calcular el porcentaje inicial de inmediato
    renderGrid();
});