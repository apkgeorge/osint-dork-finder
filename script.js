document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const searchForm = document.getElementById('searchForm');
    const resultsCard = document.getElementById('resultsCard');
    const resultsContainer = document.getElementById('resultsContainer');
    const copyAllBtn = document.getElementById('copyAll');
    const allCheckbox = document.getElementById('all');
    
    // Manejar el botón de limpiar
    document.getElementById('clearBtn').addEventListener('click', function() {
        searchForm.reset();
        resultsCard.style.display = 'none';
        allCheckbox.checked = true;
        toggleCategoryCheckboxes(true);
    });
    
    // Manejar los botones de plantillas
    document.querySelectorAll('.use-template').forEach(button => {
        button.addEventListener('click', function() {
            const dork = this.getAttribute('data-dork');
            document.getElementById('customDork').value = dork;
            allCheckbox.checked = false;
            toggleCategoryCheckboxes(false);
        });
    });
    
    // Manejar el checkbox "Todo"
    allCheckbox.addEventListener('change', function() {
        toggleCategoryCheckboxes(this.checked);
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
        }, 800);
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
        
        if (!resultsHTML) {
            resultsHTML = '<div class="alert alert-warning fade-in">No se seleccionaron categorías para buscar.</div>';
        }
        
        resultsContainer.innerHTML = resultsHTML;
        addSearchButtons();
    }
    
    function generateSearchResult(title, dorkQuery) {
        return `
            <div class="search-item fade-in">
                <h5>${title}</h5>
                <p><code>${dorkQuery}</code></p>
                <button class="btn btn-sm btn-outline-primary search-button mb-2" data-dork="${dorkQuery}">
                    <i class="fas fa-external-link-alt me-1"></i> Buscar en Google
                </button>
                <button class="btn btn-sm btn-outline-secondary copy-button" data-dork="${dorkQuery}">
                    <i class="fas fa-copy me-1"></i> Copiar
                </button>
                <hr>
            </div>
        `;
    }
    
    function addSearchButtons() {
        // Botones de búsqueda
        document.querySelectorAll('.search-button').forEach(button => {
            button.addEventListener('click', function() {
                const dorkQuery = this.getAttribute('data-dork');
                const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(dorkQuery)}`;
                window.open(googleSearchUrl, '_blank');
            });
        });
        
        // Botones de copiar
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', function() {
                const dorkQuery = this.getAttribute('data-dork');
                navigator.clipboard.writeText(dorkQuery).then(() => {
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check me-1"></i> Copiado!';
                    setTimeout(() => {
                        this.innerHTML = originalText;
                    }, 2000);
                }).catch(err => {
                    showAlert('Error al copiar: ' + err, 'danger');
                });
            });
        });
    }
    
    // Inicialización
    toggleCategoryCheckboxes(true);
});
