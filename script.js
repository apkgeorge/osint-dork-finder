document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('searchForm');
    const resultsCard = document.getElementById('resultsCard');
    const resultsContainer = document.getElementById('resultsContainer');

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const term = document.getElementById('searchTerm').value.trim();
        
        if (!term) {
            alert('Ingresa un término de búsqueda');
            return;
        }

        // Mostrar loading
        resultsCard.style.display = 'block';
        resultsContainer.innerHTML = '<div class="text-center p-4"><div class="spinner-border"></div></div>';

        // Simular búsqueda (2 segundos)
        setTimeout(() => {
            resultsContainer.innerHTML = `
                <div class="mb-3">
                    <h5>Resultados para: ${term}</h5>
                    <code>site:${term}</code>
                    <button class="btn btn-sm btn-primary ms-2" 
                            onclick="window.open('https://www.google.com/search?q=site:${encodeURIComponent(term)}', '_blank')">
                        <i class="fas fa-search"></i> Buscar
                    </button>
                </div>
            `;
        }, 2000);
    });
});
