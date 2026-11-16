document.addEventListener('DOMContentLoaded', function() {
    var contentPages = document.getElementsByClassName('content-page');

    if (contentPages.length > 0) {
        var contentPage = contentPages[0]; // Adiciona ao primeiro 'content-page' encontrado

        // Criação do conteúdo HTML a ser adicionado usando concatenação de strings
        var containerHTML = '<div class="container">' +
            '<h1>Calculadora de Tinta</h1>' +
            '<div id="warningMessage" style="color: red; display: none;"></div>' +
            '<form id="paintCalcForm">' +
            '<div id="wallsContainer"></div>' +
            '</form>' +
            '<div id="result"></div>' +
            '<div class="button-wrapper">' +
            '<button class="btn fill" onclick="addWall()">Adicionar Parede</button>' +
            '<button class="btn fill" onclick="calculatePaint()">Calcular</button>' +
            '</div>' +
            '<div class="div-select">' +
            '<label class="tipoTINTA" for="tipoTinta">Tipo de Tinta:</label>' +
            '<select id="tipoTinta">' +
            '<option value="1">Acrílica</option>' +
            '<option value="2">Brilhante</option>' +
            '<option value="3">Latex</option>' +
            '</select>' +
            '</div>' +
            '</div>' +
            '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">' +
            '<link rel="stylesheet" href="https://sistemashub.tintomax.com.br/Calculadora-de-Tinta/assets/css/styles.css">';

        // Cria um novo elemento div que conterá o HTML
        var containerDiv = document.createElement('div');
        containerDiv.innerHTML = containerHTML;

        // Adiciona este novo div ao content-page
        contentPage.appendChild(containerDiv);

        // Adiciona dinamicamente scripts externos
        var scripts = [
            'https://cdn.jsdelivr.net/npm/sweetalert2@11',
            'https://sistemashub.tintomax.com.br/Calculadora-de-Tinta/components/calcular.js'
        ];
        scripts.forEach(function(src) {
            var script = document.createElement('script');
            script.src = src;
            document.body.appendChild(script);
        });
    } else {
        console.error('Elemento content-page não encontrado!');
    }
});

