document.addEventListener('DOMContentLoaded', () => {
    const initialWallsCount = 4;
    addWall();

});

function addWall(index) {
    const wallsContainer = document.getElementById('wallsContainer');
    const wallCards = wallsContainer.getElementsByClassName('wall-card');

    if (wallCards.length >= 4) {
        Swal.fire({
            title: 'Atenção!',
            text: 'Limite máximo de 4 paredes atingido.',
            icon: 'warning',
            confirmButtonText: 'Ok'
        });
        return;
    }

    const wallDiv = document.createElement('div');
    wallDiv.className = 'wall-card';
    wallDiv.innerHTML = `
        <h3>Parede</h3>
        <label>Largura da parede (m):</label>
        <input type="number" class="width" ><br>
        <label>Altura da parede (m):</label>
        <input type="number" class="height" ><br>
        <label>Janelas (m²):</label>
        <input type="number" class="windows" placeholder="Total m² de janelas" ><br>
        <label>Portas (m²):</label>
        <input type="number" class="doors" placeholder="Total m² de portas" ><br>
    `;

    // Adiciona o botão "Remover Parede" apenas se não for a primeira parede
    if (wallCards.length > 0) {
        wallDiv.innerHTML += `<button class="btn remove" onclick="removeWall(this)">Remover Parede</button>`;
    }

    wallsContainer.appendChild(wallDiv);
}

function removeWall(button) {
    const wallsContainer = document.getElementById('wallsContainer');
    const wallCards = wallsContainer.getElementsByClassName('wall-card');

    if (wallCards.length <= 1) {
        Swal.fire({
            title: 'Atenção!',
            text: 'No mínimo 1 parede é necessária.',
            icon: 'warning',
            confirmButtonText: 'Ok'
        });
        return;
    }

    button.parentElement.remove();
}

function calculatePaint() {
    const tipoTintaSelect = document.getElementById('tipoTinta');
    const tipoTintaValue = parseInt(tipoTintaSelect.value);

    let rendimentoTinta = 0;

    // Definindo o rendimento para cada tipo de tinta
    switch (tipoTintaValue) {
        case 1:
            rendimentoTinta = 12;
            break;
        case 2:
            rendimentoTinta = 12;
            break;
        case 3:
            rendimentoTinta = 12;
            break;
        default:
            Swal.fire({
                title: 'Atenção!',
                text: 'Selecione um tipo de tinta válido.',
                icon: 'warning',
                confirmButtonText: 'Ok'
            });
            return;
    }

    const walls = document.querySelectorAll('.wall-card');
    let totalArea = 0;
    let invalidWall = false;

    walls.forEach(wall => {
        const width = parseFloat(wall.querySelector('.width').value);
        const height = parseFloat(wall.querySelector('.height').value);
        const windowsArea = parseFloat(wall.querySelector('.windows').value) || 0;
        const doorsArea = parseFloat(wall.querySelector('.doors').value) || 0;

        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            invalidWall = true;
            return;
        }

        const wallArea = (width * height) - (windowsArea + doorsArea);
        totalArea += wallArea;
       

    });

    if (invalidWall) {
        Swal.fire({
            title: 'Atenção!',
            text: 'Verifique as dimensões das paredes e preencha todos os campos corretamente.',
            icon: 'warning',
            confirmButtonText: 'Ok'
        });
        return;
    }

    if (totalArea <= 0) {
        Swal.fire({
            title: 'Atenção!',
            text: 'A área total não pode ser zero ou negativa.',
            icon: 'warning',
            confirmButtonText: 'Ok'
        });
        return;
    }

    const paintNeeded = (totalArea / rendimentoTinta) * 2;

    document.getElementById('result').innerHTML = `Você precisará de <strong>${paintNeeded.toFixed(2)}</strong> litro(s) de tinta para cobrir <strong>${totalArea.toFixed(2)}</strong> m².`;

    const availableCans = [
        { size: 1, img: 'https://sistemashub.tintomax.com.br/Calculadora-de-Tinta/assets/images/quilo.webp', litro: 1, style: "'width: 52px; height: 69px; margin-top: 14px;'"},
        { size: 2.5, img: 'https://sistemashub.tintomax.com.br/Calculadora-de-Tinta/assets/images/lata.webp', litro: 3.6, style: "'width: 83px; height: 94px; margin-top: 14px;'" },
        { size: 5, img: 'https://sistemashub.tintomax.com.br/Calculadora-de-Tinta/assets/images/galao.webp', litro: 16 , style: "'width: 102px; height: 133px; margin-top: 14px;'"}
    ];

    const canOptionsWrapperStyle = "text-align: left; display: flex; flex-wrap: wrap;";
    let canOptions = '';
        availableCans.forEach(can => {
            const qntLata = Math.ceil(paintNeeded / can.litro);
            canOptions += `
                <div class="can-option" onclick="changeCanImage(this, '${can.img}')" style="display: flex; align-items: center; margin-bottom: 20px; margin-left: 10px;">
                    <img src="${can.img}" alt="Ícone de Lata de Tinta" style="width: ${can.style}; height: ${can.style}; margin-right: 10px;" class="can-icon">
                    ${can.litro} litro(s) = ${qntLata} latas
                    <br></br>
                </div>
            `;
        });

        Swal.fire({
            title: 'Opções de Latas',
            html: `
                <div style="margin-bottom:10px; font-weight: 500; color: #d13636; font-variant-caps: small-caps;">Você precisará de ${paintNeeded.toFixed(2)} litro(s), temos essas litragens de latas de tinta para pintar ${totalArea.toFixed(2)} m².</div>
                <div class="can-options-wrapper" style="${canOptionsWrapperStyle}">${canOptions}</div>
                <button id="btnOr" onclick="sendToSales()" style="transform: unset; background: #00A884; font-size: 1.2rem;" class="btn fill">Fazer orçamento</button>
            `,
            confirmButtonText: 'Ok'
        });

        
     // Adicionar botão "Enviar para Vendas" na interface
     const messageButton = document.createElement('button');
     messageButton.textContent = 'Enviar para Vendas';
     messageButton.className = 'btn fill';
     messageButton.style.marginLeft = '10px';
     messageButton.style.backgroundColor = '#00A884';
     messageButton.onclick = function() { sendToSales(); };
     document.getElementById('result').appendChild(messageButton);
     
    
}

function changeCanImage(element, originalImage) {
    // Simples alternância para demonstração, supõe-se que existam imagens alternativas no mesmo diretório
    const alternateImage = originalImage.replace('.webp', '_colorida.webp');
    const currentSrc = element.querySelector('img').src;
    element.querySelector('img').src = currentSrc.includes('_colorida') ? originalImage : alternateImage;
}



function showOptimalCanCombination(paintNeeded) {
    const cans = [
        { size: 16, litro: 16, img: 'https://sistemashub.tintomax.com.br/Calculadora-de-Tinta/assets/images/galao.webp', description: 'Galão' },
        { size: 3.6, litro: 3.6, img: 'https://sistemashub.tintomax.com.br/Calculadora-de-Tinta/assets/images/lata.webp', description: 'Lata' },
        { size: 1, litro: 1, img: 'https://sistemashub.tintomax.com.br/Calculadora-de-Tinta/assets/images/quilo.webp', description: 'Quilo' }
    ];

    cans.sort((a, b) => b.litro - a.litro); // Ordena as latas por litro descendente

    let remainingPaint = paintNeeded;
    const results = [];

    cans.forEach(can => {
        if (remainingPaint <= 0) return;

        const count = Math.floor(remainingPaint / can.litro);
        remainingPaint -= count * can.litro;
        
        if (count > 0) {
            results.push({ type: can.size + ' L', count: count, img: can.img, description: can.description });
        }
    });

    // Adiciona uma lata extra da menor disponível se ainda restar tinta
    if (remainingPaint > 0) {
        const smallestCan = cans[cans.length - 1];
        const existingSmallCan = results.find(r => r.type === smallestCan.size + ' L');
        if (existingSmallCan) {
            existingSmallCan.count += 1;
        } else {
            results.push({ type: smallestCan.size + ' L', count: 1, img: smallestCan.img, description: smallestCan.description });
        }
    }

    const resultImages = results.map(result => `
        <div style="margin-bottom: 20px;">
            <img src="${result.img}" alt="Ícone de ${result.description}" style="width: 52px; height: 69px; margin-right: 10px;">
            ${result.count} lata(s) de ${result.type} (${result.description})
        </div>
    `);

    Swal.fire({
        title: 'Combinação Recomendada de Latas',
        html: '<div style="margin-bottom:10px;">Nós recomendamos essas latas de tinta' + resultImages.join(''),
        imageWidth: '14vh',
        imageUrl: "https://sistemashub.tintomax.com.br/Calculadora-de-Tinta/assets/images/imageCom.webp",
        imageAlt: "Custom image",
        confirmButtonText: 'Ok'
    });
}

function sendToSales() {
    const walls = document.querySelectorAll('.wall-card');
    let totalArea = 0;

    walls.forEach(wall => {
        const width = parseFloat(wall.querySelector('.width').value);
        const height = parseFloat(wall.querySelector('.height').value);
        const windowsArea = parseFloat(wall.querySelector('.windows').value) || 0;
        const doorsArea = parseFloat(wall.querySelector('.doors').value) || 0;
        const wallArea = (width * height) - (windowsArea + doorsArea);
        totalArea += wallArea;
    });

    const tipoTintaSelect = document.getElementById('tipoTinta');
    const tipoTintaValue = parseInt(tipoTintaSelect.value);
    let rendimentoTinta = 0;

    switch (tipoTintaValue) {
        case 1:
            rendimentoTinta = 12;
            tipo = 'Acrílica';
            break;
        case 2:
            rendimentoTinta = 12;
            tipo = 'Esmalte';
            break;
        case 3:
            rendimentoTinta = 12;
            tipo = 'Demarcação';
            break;
        default:
            alert('Selecione um tipo de tinta válido.');
            return;
    }

    const paintNeeded = (totalArea / rendimentoTinta) * 2;

    const message = `Olá, estou precisando pintar ${totalArea.toFixed(2)} m², necessitando de ${paintNeeded.toFixed(2)} litros de tinta do tipo ${tipo}. Preciso de um orçamento, você pode me ajudar?.`;
    const encodedMessage = encodeURIComponent(message);
    //Setar número de whatsapp---------------------------------------------------------------------------------------------------
    const whatsappUrl = `https://api.whatsapp.com/send?phone=554797590697&text=${encodedMessage}`;
    //--------------------------------------------------------------------------------------------------------------------------
    Swal.fire({
        title: 'Enviar para Vendas',
        html: `<button onclick="window.open('${whatsappUrl}');" class="btnRecom">Fazer orçamento via WhatsApp</button>`,
        imageWidth: '14vh',
        imageUrl: "https://sistemashub.tintomax.com.br/Calculadora-de-Tinta/assets/images/whats.webp",
        imageAlt: "Custom image",
        confirmButtonText: "Não quero enviar",
        confirmButtonColor: "#AF1919"
    });
}

