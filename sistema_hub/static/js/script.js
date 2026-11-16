document.addEventListener('DOMContentLoaded', function() {

    // --- Lógica do Relógio ---
    const clockElement = document.getElementById('clock');
    
    function updateClock() {
        if (clockElement) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const seconds = now.getSeconds().toString().padStart(2, '0');
            
            clockElement.innerHTML = `
                <span class="bg-orange-800 bg-opacity-30 px-4 py-2 rounded-lg font-mono text-2xl font-bold">
                    ${hours}:${minutes}:${seconds}
                </span>
            `;
        }
    }
    
    // Atualiza o relógio imediatamente e depois a cada segundo
    updateClock();
    setInterval(updateClock, 1000);

    // --- Lógica da Previsão do Tempo Local (Header) ---
    const weatherElement = document.getElementById('local-weather');
    
    function fetchLocalWeather() {
        if (!weatherElement) return;

        fetch('/api/local-weather')
            .then(response => {
                if (!response.ok) {
                    throw new Error('A resposta da rede não foi OK');
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    weatherElement.innerHTML = `
                        <div class="bg-orange-800 bg-opacity-30 px-4 py-2 rounded-lg text-right">
                            <p class="text-lg font-bold">${data.error}</p>
                            <p class="text-sm">Clima indisponível</p>
                        </div>
                    `;
                    return;
                }
                
                weatherElement.innerHTML = `
                    <div class="bg-orange-800 bg-opacity-30 px-4 py-2 rounded-lg text-right flex items-center gap-3">
                        <div class="text-right">
                            <p class="font-bold text-lg">${data.city}</p>
                            <p class="text-sm">${data.temp} - ${data.desc}</p>
                        </div>
                        <img src="/static/images/weather_icons/${data.icon}" class="h-8 w-8" alt="Ícone do tempo">
                    </div>
                `;
            })
            .catch(error => {
                console.error('Erro ao buscar previsão do tempo local:', error);
                weatherElement.innerHTML = `
                    <div class="bg-orange-800 bg-opacity-30 px-4 py-2 rounded-lg text-right">
                        <p class="text-lg font-bold">Clima indisponível</p>
                        <p class="text-sm">Erro na conexão</p>
                    </div>
                `;
            });
    }

    // --- Inicialização ---
    // Busca o clima local para o header
    fetchLocalWeather();
    
    // Atualiza o clima a cada 30 minutos (1800000 ms)
    setInterval(() => {
        fetchLocalWeather();
    }, 1800000);

    // --- Event Listeners para interatividade dos cards ---
    
    // Adiciona efeito de hover mais suave nos cards
    document.addEventListener('mouseenter', function(e) {
        if (e.target.closest('.system-card')) {
            e.target.closest('.system-card').style.transform = 'scale(1.1)';
        }
    }, true);
    
    document.addEventListener('mouseleave', function(e) {
        if (e.target.closest('.system-card')) {
            e.target.closest('.system-card').style.transform = 'scale(1)';
        }
    }, true);

    // --- Melhorias na pesquisa ---
    
    // Adiciona atalho de teclado para focar na pesquisa (Ctrl+K)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('input[type="text"]');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Escape para limpar pesquisa
        if (e.key === 'Escape') {
            const searchInput = document.querySelector('input[type="text"]');
            if (searchInput && searchInput.value) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
            }
        }
    });

    // --- Melhorias de performance para pesquisa ---
    let searchTimeout;
    
    function debounceSearch(func, wait) {
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(searchTimeout);
                func(...args);
            };
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(later, wait);
        };
    }

    // --- Scroll suave para resultados ---
    function scrollToResults() {
        const resultsSection = document.querySelector('[x-show="filtroAtivo === \'pesquisa\'"]');
        if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // --- Lazy loading das imagens ---
    const images = document.querySelectorAll('img[src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('fade-in');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => {
        imageObserver.observe(img);
    });

    // --- Debug info (remover em produção) ---
    console.log('Hub Tintomax reformulado inicializado com sucesso!');
    console.log('Relógio:', clockElement ? 'OK' : 'ERRO');
    console.log('Clima local:', weatherElement ? 'OK' : 'ERRO');
});

// --- Funções globais (se necessário) ---

// Função para forçar atualização do clima
window.updateWeather = function() {
    const weatherElement = document.getElementById('local-weather');
    if (weatherElement) {
        weatherElement.innerHTML = `
            <div class="bg-orange-800 bg-opacity-30 px-4 py-2 rounded-lg text-right">
                <p class="text-lg font-bold">Atualizando...</p>
                <p class="text-sm">Aguarde</p>
            </div>
        `;
        
        setTimeout(() => {
            location.reload();
        }, 1000);
    }
};

// Função para debug
window.debugWeather = function() {
    console.log('Forçando atualização do clima...');
    fetch('/api/local-weather')
        .then(response => response.json())
        .then(data => console.log('Dados do clima:', data))
        .catch(error => console.error('Erro:', error));
};