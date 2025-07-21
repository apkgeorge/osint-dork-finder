document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const searchForm = document.getElementById('searchForm');
    const resultsCard = document.getElementById('resultsCard');
    const resultsContainer = document.getElementById('resultsContainer');
    const copyAllBtn = document.getElementById('copyAll');
    const allCheckbox = document.getElementById('all');
    const clearBtn = document.getElementById('clearBtn');

    // Manejar el checkbox "Todo"
    allCheckbox.addEventListener('change', function() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:not(#all)');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    // Manejar el botón de limpiar
    clearBtn.addEventListener('click', function() {
        searchForm.reset();
        resultsCard.style.display = 'none';
        allCheckbox.checked = true;
    });

    // Manejar el envío del formulario
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = document.getElementById('searchTerm').value.trim();
        const customDork = document.getElementById('customDork').value.trim();

        if (!searchTerm && !customDork) {
            alert('Por favor ingresa un término de búsqueda o un dork personalizado');
            return;
        }

        showLoading();
        setTimeout(() => {
            performSearch(searchTerm, customDork);
        }, 300);
    });

    // Función para mostrar carga
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

    // Función principal de búsqueda
    function performSearch(term, customDork) {
        resultsContainer.innerHTML = '';
        
        if (customDork) {
            addSearchResult('Búsqueda personalizada', customDork);
            return;
        }

        // Generar dorks según categorías seleccionadas
        if (document.getElementById('emails').checked) {
            addSearchResult('Correos electrónicos', `intext:"@${term}" OR intext:"${term}@"`);
        }
        
        if (document.getElementById('domains').checked) {
            addSearchResult('Dominios', `site:${term} OR inurl:${term}`);
        }
        
        if (document.getElementById('social').checked) {
            addSearchResult('Redes sociales', `site:facebook.com ${term} OR site:twitter.com ${term}`);
        }
        
        if (document.getElementById('documents').checked) {
            addSearchResult('Documentos', `site:${term} filetype:pdf`);
        }
        
        if (document.getElementById('credentials').checked) {
            addSearchResult('Credenciales', `intitle:"index of" "${term}"`);
        }
    }

    // Añadir resultados al DOM
    function addSearchResult(title, dork) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'mb-3 p-3 border-bottom';
        resultDiv.innerHTML = `
            <h5>${title}</h5>
            <code>${dork}</code>
            <button class="btn btn-sm btn-primary ms-2 search-btn" data-dork="${dork}">
                <i class="fas fa-search"></i> Buscar en Google
            </button>
            <button class="btn btn-sm btn-secondary ms-2 copy-btn" data-dork="${dork}">
                <i class="fas fa-copy"></i> Copiar
            </button>
        `;
        resultsContainer.appendChild(resultDiv);
    }

    // Delegación de eventos para elementos dinámicos
    document.addEventListener('click', function(e) {
        // Botones de búsqueda
        if (e.target.closest('.search-btn')) {
            const dork = e.target.closest('.search-btn').getAttribute('data-dork');
            window.open(`https://www.google.com/search?q=${encodeURIComponent(dork)}`, '_blank');
        }
        
        // Botones de copiar
        if (e.target.closest('.copy-btn')) {
            const dork = e.target.closest('.copy-btn').getAttribute('data-dork');
            navigator.clipboard.writeText(dork)
                .then(() => alert('Dork copiado al portapapeles'))
                .catch(err => console.error('Error al copiar:', err));
        }
        
        // Plantillas predefinidas
        if (e.target.closest('.use-template')) {
            document.getElementById('customDork').value = e.target.closest('.use-template').getAttribute('data-dork');
            document.getElementById('all').checked = false;
        }
    });

    // Botón Copiar Todos
    copyAllBtn.addEventListener('click', function() {
        const allDorks = Array.from(document.querySelectorAll('.search-btn'))
            .map(btn => btn.getAttribute('data-dork'))
            .join('\n\n');
        
        if (allDorks) {
            navigator.clipboard.writeText(allDorks)
                .then(() => alert('Todos los dorks copiados'))
                .catch(err => console.error('Error al copiar:', err));
        } else {
            alert('No hay dorks para copiar');
        }
    });
});
