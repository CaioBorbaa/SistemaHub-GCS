<?php
session_start(); // Garantir que a sessão está iniciada
$sessionId = session_id();
// Tente obter o endereço IP do cabeçalho da Cloudflare primeiro
if (isset($_SERVER['HTTP_CF_CONNECTING_IP'])) {
    $userIp = $_SERVER['HTTP_CF_CONNECTING_IP'];
} elseif (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    // Caso esteja usando um proxy que define o cabeçalho X-Forwarded-For
    $userIp = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
} else {
    // Caso contrário, use o endereço IP direto do usuário
    $userIp = $_SERVER['REMOTE_ADDR'];
}

include("../conexao/conexao.php");


// Verificar se a sessão já existe
$stmt = $conexao->prepare("SELECT sessao_id FROM sessoes_ativas WHERE sessao_id = ?");
$stmt->execute([$sessionId]);
if ($stmt->fetch()) {
    // Atualizar a sessão existente
    $updateStmt = $conexao->prepare("UPDATE sessoes_ativas SET ultima_atividade = CURRENT_TIMESTAMP WHERE sessao_id = ?");
    $updateStmt->execute([$sessionId]);
} else {
    // Inserir nova sessão
    $insertStmt = $conexao->prepare("INSERT INTO sessoes_ativas (sessao_id, ip) VALUES (?, ?)");
    $insertStmt->execute([$sessionId, $userIp]);
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <title>Catálogo de Sistemas</title>
    <link rel="stylesheet" href="../css/catalogo.css">
    <link rel="stylesheet" href="../css/modal.css">
    <link rel="stylesheet" href="../css/teste.css">
    <meta http-equiv="refresh" content="3600">
    <?php include '../header.php'; ?>
    
    <!-- CSS para as decorações de Páscoa -->
    <style>
        /* Estilos para o banner de Páscoa */
        .easter-banner {
            width: 100%;
            text-align: center;
            padding: 10px 0;
            margin: 10px 0;
            background-color: rgba(255, 230, 250, 0.7);
            border-radius: 8px;
            font-family: 'Arial', sans-serif;
            color: #8B4513;
        }
        
        /* Modificação sutil no footer para tema de Páscoa */
        .footer.easter {
            background: linear-gradient(90deg, #ffcce6, #ccf2ff);
            padding: 10px;
            border-radius: 5px;
        }
        
        /* Estilos para os ovos pendurados */
        .egg-container {
            top: 0;
            left: 0;
            width: 100%;
            overflow: hidden;
            pointer-events: none;
            z-index: 1000;
        }
        
        .hanging-item {
            position: absolute;
            width: 2px;
            height: 80px; /* Comprimento da linha vermelha */
            top: 0;
            transform-origin: top center;
        }
        
        .hanging-string {
            position: absolute;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 0, 0, 0.7);
        }
        
        .hanging-egg {
            position: absolute;
            bottom: -45px; /* Posiciona o ovo no final da linha */
            left: -20px; /* Centraliza o ovo (40px de largura / 2) */
            width: 40px; /* Tamanho aumentado */
            height: 53px; /* Mantém a proporção */
            transform-origin: center top;
        }
        
        /* Estilos para ovos nos cards */
        .card-egg {
            position: absolute;
            width: 25px;
            height: 33px;
            bottom: 5px;
            right: 5px;
            pointer-events: none;
        }
        
        /* Mantém o estilo original dos cards */
        .system-grid {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 20px;
            padding: 20px;
        }
        
        .itens {
            width: auto; /* Volta ao tamanho original */
            margin: 10px;
            text-align: center;
            position: relative;
        }
        
        /* Estilo para o coelho pulando no header */
        .running-bunny {
            position: absolute;
            width: 400px;
            height: auto;
            bottom: -5px; /* Ajustado para aparecer na parte inferior do header */
            z-index: 1000; /* Valor alto para garantir que fique acima de outros elementos */
            animation: bunnyJump 10s linear infinite;
            pointer-events: none; /* Permite que cliques passem pelo coelho */
        }
        
        @keyframes bunnyJump {
            0% { left: -80px; }
            100% { left: 100%; }
        }
    </style>
</head>

<body>
    <header>
        <div style="position: absolute; z-index: 1000; width: 100%; height: 100%; overflow: hidden; pointer-events: none;">
            <img src="../assets/easter/bunny.gif" alt="Coelho da Páscoa" style="position: absolute; width: 265px; height: auto; top: 0; left: -80px; animation: bunnyJump 25s linear infinite; pointer-events: none; margin-top: -67px;">
        </div>
        <nav class="navbar">
            <!-- Seção Esquerda: Relógio -->
            <div class="navbar-left">
                <time id="clock">12:00:00</time>
            </div>
            
            <!-- Seção Central: Logo -->
            <div class="navbar-center">
                <a href="">
                    <img src="../assets/logo.png" alt="Logo da Tintomax" class="logo">
                </a>
            </div>

            <!-- Seção Direita: Botão Área Comercial -->
            <div class="navbar-right">
                <div class="vazio">
                    <div class="vazio2">
                        <a href="../usuario/comercial.php" class="area-comercial-btn">ÁREA COMERCIAL</a>
                    </div>
                </div>
            </div>
        </nav>
    </header>
    
    <!-- Rodapé com estilo de Páscoa -->
    <div class="footer">
        Desenvolvido pelo Setor de T.I. da Tintomax <br> 🐰 Especial de Páscoa 🥚
    </div>
    <br>
    
    <!-- Contêiner para o Widget de Previsão do Tempo -->
    <div class="weather-widget-container">
        <!--Joinville Clima-->
        <a class="weatherwidget-io" href="https://forecast7.com/pt/n26d30n48d85/joinville/" data-label_1="JOINVILLE" data-label_2="Clima" data-icons="Climacons Animated" data-mode="Current" data-theme="pure" data-basecolor="" >JOINVILLE Clima</a>
        <script>
            !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');
        </script>

        <!--Barra Velha Clima-->
        <a class="weatherwidget-io" href="https://forecast7.com/pt/n26d63n48d68/barra-velha/" data-label_1="BARRA VELHA" data-label_2="Clima" data-icons="Climacons Animated" data-mode="Current" data-theme="pure" data-basecolor="" >BARRA VELHA Clima</a>
        <script>
            !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');
        </script>

        <!--São Francisco Clima-->
        <a class="weatherwidget-io" href="https://forecast7.com/pt/n26d25n48d62/sao-francisco-do-sul/" data-label_1="SÃO FRANCISCO DO SUL" data-label_2="Clima" data-icons="Climacons Animated" data-mode="Current" data-theme="pure" data-basecolor="" >SÃO FRANCISCO DO SUL CLIMA</a>
        <script>
            !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');
        </script>
    </div>

    <!-- Modal de notificação -->
    <div id="notificationModal" class="modalNot" style="display:none;">
        <button class="close-button-Not">&times;</button>
        <div class="image-container">
            <div class="modal-content-Not">
                <div class="titleNot" id="modalTitleNot"></div>
                <img id="modalImageNot" src="" alt="" style="max-width: 100%;">
            </div>
        </div>
    </div>

    <!-- Exibição dos projetos/sistemas -->
    <?php include("../DB/catalogoDB.php"); ?>
    <div class="system-grid">
        <?php foreach ($projetos as $projeto): ?>
            <div class="itens <?= empty($projeto['link']) ? 'open-modal' : '' ?>"
                data-projeto-id="<?= $projeto['id']; ?>"
                data-image="<?= empty($projeto['link']) ? '../assets/modals/' . urlencode($projeto['nome']) . '.webp' : ''; ?>">
                <?php if (!empty($projeto['link'])): ?>
                    <a href="<?= htmlspecialchars($projeto['link'], ENT_QUOTES, 'UTF-8'); ?>" target="_blank">
                        <img class="poster" src="data:image/jpeg;base64,<?= $projeto['imagem_base64']; ?>" alt="<?= htmlspecialchars($projeto['nome'], ENT_QUOTES, 'UTF-8'); ?>">
                    </a>
                <?php else: ?>
                    <img class="poster" src="data:image/jpeg;base64,<?= $projeto['imagem_base64']; ?>" alt="<?= htmlspecialchars($projeto['nome'], ENT_QUOTES, 'UTF-8'); ?>">
                <?php endif; ?>
                <h2><?= htmlspecialchars($projeto['nome'], ENT_QUOTES, 'UTF-8'); ?></h2>
            </div>
        <?php endforeach; ?>
    </div>

    <!-- Modal para exibir a imagem -->
    <div id="myModal" class="modal">
        <span class="closeModal">&times;</span>
        <div class="modal-content">
            <a class="prev" onclick="changeImage(-1)">&#10094;</a>
            <img id="modalImg" src="" alt="Imagem do Projeto" style="width: 100%;">
            <a class="next" onclick="changeImage(1)">&#10095;</a>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
    <script>
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        OneSignalDeferred.push(function(OneSignal) {
            OneSignal.init({
                appId: "64d0ab10-a576-486f-ba38-7ceb56cf160e",
            });
        });
        
        // Relógio em tempo real
        function updateClock() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            document.getElementById('clock').textContent = `${hours}:${minutes}:${seconds}`;
        }
        
        // Atualizar o relógio a cada segundo
        setInterval(updateClock, 1000);
        updateClock(); // Inicializa o relógio
        
        // Script para os ovos balançando automaticamente
        document.addEventListener('DOMContentLoaded', function() {
            // Cria o container principal
            const container = document.createElement('div');
            container.className = 'egg-container';
            document.body.appendChild(container);
            
            // Define as posições dos ovos (reduzido para 5)
            const eggPositions = [
                '5%', '20%', '36%', '63%', '79%', '94%'
            ];
            
            // Array para armazenar as informações de cada item pendurado
            const hangingItems = [];
            
            // Cria os itens pendurados
            eggPositions.forEach((position, index) => {
                // Cria o elemento do item pendurado
                const item = document.createElement('div');
                item.className = 'hanging-item';
                item.style.left = position;
                container.appendChild(item);
                
                // Cria a linha
                const string = document.createElement('div');
                string.className = 'hanging-string';
                item.appendChild(string);
                
                // Cria o ovo (usa um dos 4 tipos aleatoriamente)
                const egg = document.createElement('img');
                egg.className = 'hanging-egg';
                const eggNum = Math.floor(Math.random() * 4) + 1; // Número aleatório entre 1 e 4
                egg.src = `../assets/easter/egg${eggNum}.png`;
                item.appendChild(egg);
                
                // Armazena as informações com parâmetros para o movimento pendular
                hangingItems.push({
                    element: item,
                    position: parseFloat(position),
                    angle: Math.random() * 5, // Ângulo inicial aleatório
                    velocity: 0,
                    amplitude: 5 + Math.random() * 10, // Amplitude aleatória entre 5 e 15 graus
                    frequency: 0.5 + Math.random() * 1, // Frequência aleatória entre 0.5 e 1.5
                    phase: Math.random() * Math.PI * 2, // Fase aleatória para desincronizar
                    lastUpdate: Date.now()
                });
            });
            
            // Função para simular um movimento pendular natural
            function updatePendulumMovement() {
                const now = Date.now();
                
                hangingItems.forEach(item => {
                    // Tempo em segundos (dividido por 1000)
                    const time = now / 1000;
                    
                    // Calcula o novo ângulo usando fórmula de movimento pendular
                    const angle = item.amplitude * Math.sin(time * item.frequency + item.phase);
                    
                    // Aplica o ângulo
                    item.element.style.transform = `rotate(${angle}deg)`;
                });
                
                // Continua a animação
                requestAnimationFrame(updatePendulumMovement);
            }
            
            // Inicia a animação pendular
            updatePendulumMovement();
            
            // Adiciona interatividade - os ovos ainda respondem ao movimento do mouse,
            // mas continuam se movendo mesmo sem interação
            document.addEventListener('mousemove', function(e) {
                const windowWidth = window.innerWidth;
                const now = Date.now() / 1000; // Tempo em segundos
                
                hangingItems.forEach(item => {
                    // Calcula a posição absoluta do item
                    const itemX = (item.position / 100) * windowWidth;
                    
                    // Calcula a distância do mouse ao item (normalizada)
                    const distance = (e.clientX - itemX) / windowWidth;
                    
                    // Ajusta temporariamente a amplitude com base na posição do mouse
                    const tempAmplitude = item.amplitude + distance * 10;
                    
                    // Calcula um novo ângulo combinando o movimento natural e a influência do mouse
                    const angle = tempAmplitude * Math.sin(now * item.frequency + item.phase);
                    
                    // Aplica o ângulo
                    item.element.style.transform = `rotate(${angle}deg)`;
                });
            });
            // Adicione isso no final do documento DOMContentLoaded
            console.log("Verificando imagem do coelho...");
            const img = new Image();
            img.onload = function() {
                console.log("A imagem do coelho carregou com sucesso!");
            };
            img.onerror = function() {
                console.error("Erro ao carregar a imagem do coelho! Verifique o caminho do arquivo.");
            };
            img.src = "../assets/easter/bunny.gif";
        });
    </script>
    
    <script src="../js/home.js"></script>
    <script src="../js/notify.js"></script>
    <script src="../js/catalogo.js"></script>

    <script>
        // Script para o carrossel de imagens no modal
        var currentImageIndex = 0;
        var images = [
            '../assets/modals/1.webp',
            '../assets/modals/2.webp',
            '../assets/modals/3.webp',
            '../assets/modals/4.webp',
            '../assets/modals/5.webp',
        ];

        // Função para abrir o modal e iniciar com a primeira imagem do carrossel
        function openModal() {
            var modal = document.getElementById("myModal");
            var modalImg = document.getElementById("modalImg");

            currentImageIndex = 0; // Começa com a primeira imagem
            if (modal && modalImg) {
                modal.style.display = "block";
                modalImg.src = images[currentImageIndex];
            }
        }

        // Função para mudar a imagem no modal
        function changeImage(step) {
            currentImageIndex += step;

            if (currentImageIndex >= images.length) {
                currentImageIndex = 0;
            } else if (currentImageIndex < 0) {
                currentImageIndex = images.length - 1;
            }

            var modalImg = document.getElementById("modalImg");
            modalImg.src = images[currentImageIndex];
        }

        // Evento de clique para abrir o modal
        document.querySelectorAll('.open-modal').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault(); // Prevenir a ação padrão
                openModal(); // Abre o modal com a primeira imagem do carrossel
            });
        });

        // Configuração para fechar o modal
        var span = document.querySelector('.closeModal'); 
        if (span) {
            span.onclick = function() {
                var modal = document.getElementById("myModal");
                if (modal) {
                    modal.style.display = "none";
                }
            }
        }

        // Fecha o modal ao clicar fora dele
        window.onclick = function(event) {
            var modal = document.getElementById("myModal");
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
        
        // Atualização da sessão
        $(document).ready(function() {
            setInterval(function() {
                $.ajax({
                    url: '../DB/envioSessao.php',
                    type: 'POST',
                    data: { sessionId: '<?= $sessionId; ?>' },
                    success: function(response) {
                        console.log("Sessão atualizada");
                    },
                    error: function(xhr, status, error) {
                        console.error("Erro ao atualizar sessão: " + error);
                    }
                });
            }, 1000);
        });
    </script>
    
    <?php include '../footer.php'; ?>
    
<!-- Novo footer na cor do header com as pegadas -->
<div style="width: 100%; background-color: #FF7B00; padding: 7.5px 0; text-align: center; margin-top: 50px; border-radius: 5px;">
    <div style="color: white; font-size: 16px;">
        Desenvolvido pelo Setor de T.I. da Tintomax <br> 🐰 Especial de Páscoa 🥚
    </div>
</div>
</body>
</html>