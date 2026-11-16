function checkSystemStatus(systemUrl, buttonElement) {
    // Aqui você pode fazer uma requisição AJAX para verificar o status do sistema
    // Este é um exemplo genérico, você precisará adaptá-lo à sua infraestrutura
    fetch(systemUrl)
        .then(response => {
            if (response.ok) {
                buttonElement.nextElementSibling.textContent = 'Online';
                buttonElement.nextElementSibling.className = 'status-indicator online';
            } else {
                buttonElement.nextElementSibling.textContent = 'Offline';
                buttonElement.nextElementSibling.className = 'status-indicator offline';
            }
        })
        .catch(error => {
            buttonElement.nextElementSibling.textContent = 'Offline';
            buttonElement.nextElementSibling.className = 'status-indicator offline';
        });
}
