// Função para registrar cliques em projetos com link
document.querySelectorAll('.itens a').forEach(item => {
    item.addEventListener('click', function(e) {
        const projetoId = this.parentElement.getAttribute('data-projeto-id'); // Supondo que cada .itens tenha um data-projeto-id
        registrarClique(projetoId, 'link');
    });
});

// Função para registrar cliques em projetos com modal
document.querySelectorAll('.itens').forEach(item => {
    // Checa se o projeto tem um modal
    if (!item.querySelector('a')) {
        item.addEventListener('click', function(e) {
            const projetoId = this.getAttribute('data-projeto-id'); // Supondo que cada .itens tenha um data-projeto-id
            registrarClique(projetoId, 'modal');
        });
    }
});

// Função para enviar informações de clique para o servidor
function registrarClique(projetoId, tipo) {
    const data = { projetoId, tipo };
    console.log(data); 
    fetch('../DB/registrar_cliques.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}
