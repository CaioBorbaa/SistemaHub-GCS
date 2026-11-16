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
    
    <style>
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
    </style>
</head>

<body>
    <header>
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
</body>
</html>