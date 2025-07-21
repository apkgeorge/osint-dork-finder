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
        toggleCategoryCheckboxes(this.checked);
    });

    // Manejar el botón de limpiar
    clearBtn.addEventListener('click', function() {
        searchForm.reset();
        resultsCard.style.display = 'none';
        allCheckbox.checked = true;
        toggleCategoryCheckboxes(true);
    });

    // Manejar el envío del formulario
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const searchTerm = document.getElementById('searchTerm').value.trim();
        const customDork = document.getElementById('customDork').value.trim();

        if (!searchTerm && !customDork) {
            showAlert('Por favor ingresa un término de búsqueda o un dork personalizado', 'warning');
            return;
        }

        showLoading();
        setTimeout(() => {
            performSearch(searchTerm, customDork);
        }, 300);
    });

    // Delegación de eventos para botones dinámicos
    document.addEventListener('click', function(e) {
        // Botones de búsqueda en Google
        if (e.target.classList.contains('search-button') || e.target.closest('.search-button')) {
            const button = e.target.classList.contains('search-button') ? 
                          e.target : e.target.closest('.search-button');
            const dork = button.getAttribute('data-dork');
            window.open(`https://www.google.com/search?q=${encodeURIComponent(dork)}`, '_blank');
        }

        // Botones de plantillas
        if (e.target.classList.contains('use-template') || e.target.closest('.use-template')) {
            const button = e.target.classList.contains('use-template') ? 
                          e.target : e.target.closest('.use-template');
            document.getElementById('customDork').value = button.getAttribute('data-dork');
            document.getElementById('all').checked = false;
            toggleCategoryCheckboxes(false);
        }
    });

    // Copiar todos los dorks
    copyAllBtn.addEventListener('click', function() {
        const dorks = Array.from(document.querySelectorAll('.search-item code'))
            .map(code => code.textContent)
            .join('\n\n');

        if (dorks) {
            navigator.clipboard.writeText(dorks).then(() => {
                showAlert('Todos los dorks copiados al portapapeles', 'success');
            }).catch(err => {
                showAlert('Error al copiar: ' + err, 'danger');
            });
        } else {
            showAlert('No hay dorks para copiar', 'warning');
        }
    });

    // Funciones auxiliares
    function toggleCategoryCheckboxes(checked) {
        document.querySelectorAll('input[type="checkbox"]:not(#all)').forEach(checkbox => {
            checkbox.checked = checked;
        });
    }

    function showLoading() {
        resultsCard.style.display = 'block';
        resultsContainer.innerHTML = `
            <div class="text-center py-4 fade-in">
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

    function performSearch(searchTerm, customDork) {
        let resultsHTML = '';
        
        if (customDork) {
            resultsHTML += generateSearchResult('Búsqueda personalizada', customDork);
        } else {
            const term = searchTerm.includes(' ') ? `"${searchTerm}"` : searchTerm;
            
            if (document.getElementById('emails').checked) {
                resultsHTML += generateSearchResult(
                    'Correos electrónicos', 
                    `intext:"@${term}" OR intext:"${term}@"`
                );
            }
            
            if (document.getElementById('domains').checked) {
                resultsHTML += generateSearchResult(
                    'Dominios y sitios', 
                    `site:${term} OR inurl:${term}`
                );
                resultsHTML += generateSearchResult(
                    'Subdominios', 
                    `site:*.${term}`
                );
            }
            
            if (document.getElementById('social').checked) {
                resultsHTML += generateSearchResult(
                    'Redes sociales', 
                    `site:facebook.com ${term} OR site:twitter.com ${term} OR site:linkedin.com/in ${term} OR site:instagram.com ${term}`
                );
            }
            
            if (document.getElementById('documents').checked) {
                resultsHTML += generateSearchResult(
                    'Documentos PDF', 
                    `site:${term} filetype:pdf`
                );
                resultsHTML += generateSearchResult(
                    'Documentos Office', 
                    `site:${term} (filetype:doc OR filetype:docx OR filetype:xls OR filetype:xlsx OR filetype:ppt OR filetype:pptx)`
                );
            }
            
            if (document.getElementById('credentials').checked) {
                resultsHTML += generateSearchResult(
                    'Credenciales expuestas', 
                    `intitle:"index of" "${term}" OR intext:"password" site:${term}`
                );
                resultsHTML += generateSearchResult(
                    'Archivos de configuración', 
                    `site:${term} (ext:env OR ext:config OR ext:conf OR ext:cfg)`
                );
            }
        }
        
        resultsContainer.innerHTML = resultsHTML || '<div class="alert alert-warning">No se seleccionaron categorías para buscar.</div>';
    }

    function generateSearchResult(title, dorkQuery) {
        return `
            <div class="search-item fade-in mb-3">
                <h5>${title}</h5>
                <p><code>${dorkQuery}</code></p>
                <button class="btn btn-sm btn-outline-primary search-button mb-2" data-dork="${dorkQuery}">
                    <i class="fas fa-external-link-alt me-1"></i> Buscar en Google
                </button>
                <button class="btn btn-sm btn-outline-secondary copy-dork" data-dork="${dorkQuery}">
                    <i class="fas fa-copy me-1"></i> Copiar
                </button>
                <hr>
            </div>
        `;
    }

    // Evento para copiar dorks individuales
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('copy-dork') || e.target.closest('.copy-dork')) {
            const button = e.target.classList.contains('copy-dork') ? 
                          e.target : e.target.closest('.copy-dork');
            const dork = button.getAttribute('data-dork');
            
            navigator.clipboard.writeText(dork).then(() => {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check me-1"></i> Copiado!';
                setTimeout(() => {
                    button.innerHTML = originalText;
                }, 2000);
            });
        }
    });

    // Inicialización
    toggleCategoryCheckboxes(true);
});
