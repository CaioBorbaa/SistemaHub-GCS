// Função para buscar notificações e exibi-las
function fetchNotifications() {
    fetch('../DB/getNotifyBD.php')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Verifica se a resposta inclui a propriedade 'mensagem'
            if (data.hasOwnProperty('mensagem')) {
                console.log(data.mensagem);
                return; // Encerra a execução da função aqui se houver uma mensagem de erro
            }

            // Procede apenas se 'data' for um array e não estiver vazio
            if (Array.isArray(data) && data.length > 0) {
                const modalContent = document.querySelector('.modal-content-Not');
                // Limpa as notificações anteriores

                data.forEach(notificacao => {
                    // Cria o título da notificação
                    const title = document.createElement('modalTitleNot');
                    title.innerText = notificacao.titulo;
                    title.style.color = 'white';

                    // Cria a imagem da notificação
                    const image = document.createElement('img');
                    image.src = notificacao.imagem; // A imagem já está em base64
                    image.alt = 'Imagem da Notificação';
                    image.style.maxWidth = '50%';
                    image.style.borderRadius = '2%';
                    image.style.boxShadow = '0 0px 8px rgba(0, 0, 0, 0.3)';

                    // Adiciona o título e a imagem ao modal
                    modalContent.appendChild(title);
                    modalContent.appendChild(image);
                });

                // Exibe o modal
                document.getElementById('notificationModal').style.display = 'block';
            }
        })
        .catch(error => console.error('Error:', error));
}

// Chama a função fetchNotifications para carregar as notificações
fetchNotifications();

document.addEventListener('DOMContentLoaded', (event) => {
    const modal = document.getElementById('notificationModal'); // Certifique-se de que este é o ID do seu modal

    // Função para fechar o modal
    function closeModal() {
        document.getElementById('notificationModal').style.display = "none";
    }

    // Fecha o modal ao clicar fora dele
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    // Delegação de Eventos para o botão de fechar
    document.body.addEventListener('click', function(event) {
        if (event.target.matches('.close-button-Not')) {
            closeModal();
        }
    });
});
