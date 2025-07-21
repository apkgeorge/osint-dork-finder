document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const searchForm = document.getElementById('searchForm');
    const resultsCard = document.getElementById('resultsCard');
    const resultsContainer = document.getElementById('resultsContainer');
    const copyAllBtn = document.getElementById('copyAll');
    const allCheckbox = document.getElementById('all');
    const clearBtn = document.getElementById('clearBtn');

    // Variables de estado
    let currentSearchTerm = '';
    let currentDorks = [];

    // Inicialización
    initEventListeners();
    toggleCategoryCheckboxes(true);

    function initEventListeners() {
        // Checkbox "Todo"
        allCheckbox.addEventListener('change', function() {
            toggleCategoryCheckboxes(this.checked);
        });

        // Botón Limpiar
        clearBtn.addEventListener('click', resetSearch);

        // Formulario de búsqueda
        searchForm.addEventListener('submit', handleSearchSubmit);

        // Botón Copiar Todos
        copyAllBtn.addEventListener('click', copyAllDorks);

        // Delegación de eventos para elementos dinámicos
        document.addEventListener('click', handleDynamicElements);
    }

    function handleSearchSubmit(e) {
        e.preventDefault();
        currentSearchTerm = document.getElementById('searchTerm').value.trim();
        const customDork = document.getElementById('customDork').value.trim();

        if (!currentSearchTerm && !customDork) {
            showAlert('Por favor ingresa un término de búsqueda o un dork personalizado', 'warning');
            return;
        }

        showLoading();
        
        // Pequeño retraso para mejor experiencia de usuario
        setTimeout(() => {
            performSearch(currentSearchTerm, customDork);
        }, 300);
    }

    function performSearch(term, customDork) {
        currentDorks = [];
        resultsContainer.innerHTML = '';
        
        // Mostrar tarjeta de resultados
        resultsCard.style.display = 'block';

        if (customDork) {
            addSearchResult('Búsqueda personalizada', customDork);
            return;
        }

        // Generar dorks según categorías seleccionadas
        const formattedTerm = term.includes(' ') ? `"${term}"` : term;
        
        if (document.getElementById('emails').checked) {
            addDorkCategory('Correos electrónicos', [
                `intext:"@${formattedTerm}"`,
                `intext:"${formattedTerm}@"`,
                `"@${formattedTerm}" filetype:csv`
            ]);
        }
        
        if (document.getElementById('domains').checked) {
            addDorkCategory('Dominios y sitios', [
                `site:${formattedTerm}`,
                `inurl:${formattedTerm}`,
                `site:*.${formattedTerm}`
            ]);
        }
        
        if (document.getElementById('social').checked) {
            addDorkCategory('Redes sociales', [
                `site:facebook.com ${formattedTerm}`,
                `site:twitter.com ${formattedTerm}`,
                `site:linkedin.com/in ${formattedTerm}`,
                `site:instagram.com ${formattedTerm}`
            ]);
        }
        
        if (document.getElementById('documents').checked) {
            addDorkCategory('Documentos', [
                `site:${formattedTerm} filetype:pdf`,
                `site:${formattedTerm} (filetype:doc OR filetype:docx)`,
                `site:${formattedTerm} (filetype:xls OR filetype:xlsx)`,
                `site:${formattedTerm} (filetype:ppt OR filetype:pptx)`
            ]);
        }
        
        if (document.getElementById('credentials').checked) {
            addDorkCategory('Credenciales', [
                `intitle:"index of" "${formattedTerm}"`,
                `intext:"password" site:${formattedTerm}`,
                `site:${formattedTerm} (ext:env OR ext:config)`,
                `filetype:log intext:"password" ${formattedTerm}`
            ]);
        }

        if (currentDorks.length === 0) {
            resultsContainer.innerHTML = '<div class="alert alert-warning">No se seleccionaron categorías para buscar.</div>';
        }
    }

    function addDorkCategory(title, dorks) {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'mb-4';
        categoryElement.innerHTML = `<h4>${title}</h4>`;
        
        dorks.forEach(dork => {
            currentDorks.push(dork);
            categoryElement.appendChild(createDorkResultElement(dork));
        });
        
        resultsContainer.appendChild(categoryElement);
    }

    function createDorkResultElement(dork) {
        const element = document.createElement('div');
        element.className = 'd-flex align-items-center mb-2 p-2 bg-light rounded';
        element.innerHTML = `
            <code class="flex-grow-1 me-2">${dork}</code>
            <button class="btn btn-sm btn-outline-primary search-button me-2" data-dork="${dork}">
                <i class="fas fa-external-link-alt me-1"></i> Buscar
            </button>
            <button class="btn btn-sm btn-outline-secondary copy-dork" data-dork="${dork}">
                <i class="fas fa-copy"></i>
            </button>
        `;
        return element;
    }

    function handleDynamicElements(e) {
        // Botones de búsqueda en Google
        if (e.target.closest('.search-button')) {
            const button = e.target.closest('.search-button');
            const dork = button.getAttribute('data-dork');
            window.open(`https://www.google.com/search?q=${encodeURIComponent(dork)}`, '_blank');
        }

        // Botones de plantillas
        if (e.target.closest('.use-template')) {
            const button = e.target.closest('.use-template');
            document.getElementById('customDork').value = button.getAttribute('data-dork');
            document.getElementById('all').checked = false;
            toggleCategoryCheckboxes(false);
        }

        // Botones Copiar
        if (e.target.closest('.copy-dork')) {
            const button = e.target.closest('.copy-dork');
            copyToClipboard(button.getAttribute('data-dork'), button);
        }
    }

    function copyAllDorks() {
        if (currentDorks.length === 0) {
            showAlert('No hay dorks para copiar', 'warning');
            return;
        }

        const allDorks = currentDorks.join('\n\n');
        copyToClipboard(allDorks, copyAllBtn, 'Todos los dorks copiados');
    }

    function copyToClipboard(text, button, successMessage = 'Copiado al portapapeles') {
        navigator.clipboard.writeText(text).then(() => {
            const originalHTML = button.innerHTML;
            button.innerHTML = `<i class="fas fa-check me-1"></i> ${successMessage}`;
            button.classList.add('btn-success');
            button.classList.remove('btn-outline-primary', 'btn-outline-secondary');
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove('btn-success');
                if (button.classList.contains('search-button')) {
                    button.classList.add('btn-outline-primary');
                } else {
                    button.classList.add('btn-outline-secondary');
                }
            }, 2000);
        }).catch(err => {
            showAlert('Error al copiar: ' + err, 'danger');
        });
    }

    function toggleCategoryCheckboxes(checked) {
        document.querySelectorAll('input[type="checkbox"]:not(#all)').forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    function resetSearch() {
        searchForm.reset();
        resultsCard.style.display = 'none';
        currentSearchTerm = '';
        currentDorks = [];
        allCheckbox.checked = true;
        toggleCategoryCheckboxes(true);
    }

    function showLoading() {
        resultsCard.style.display = 'block';
        resultsContainer.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <p class="mt-3">Generando búsquedas avanzadas...</p>
            </div>
        `;
    }

    function showAlert(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container.mt-4');
        container.prepend(alert);
        
        setTimeout(() => {
            alert.classList.remove('show');
            setTimeout(() => alert.remove(), 150);
        }, 5000);
    }
});
