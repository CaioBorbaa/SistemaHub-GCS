function checkSystemStatus(systemUrl, buttonElement) {
   //Configura o status indicadores dos servers, como online ou offline
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
