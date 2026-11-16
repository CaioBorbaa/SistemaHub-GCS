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

<html>
        <head>
            <title>Catalogo de Sistemas</title>
            <link rel="stylesheet" href="../css/catalogo.css">
            <link rel="stylesheet" href="../css/modal.css">
            <?php include '../header.php'; ?>
        </head>

        <body>
        
            <header>
                <nav class="navbar">
                    <!-- Seção Esquerda: Relógio -->
                    <div class="navbar-left">
                        <time>12:00:00</time>
                    </div>
                    
                    <!-- Seção Central: Logo -->
                    <div class="navbar-center">
                        <a href="../usuario/catalogo.php">
                            <img src="../assets/logo.png" alt="Logo da Tintomax" class="logo">
                        </a>
                    </div>
        
                    <!-- Seção Direita: Outros Itens (exemplo com o menu) -->
                    <div class="navbar-right">
                        <div class="vazio">
                            <div class="vazio2">
                                <div class="vazio3"></div>
                                <!-- Links ou outros elementos -->
                            </div>
                        </div>
                    </div>
                </nav>
        

                <title> FORNECEDORES </title>
            </header>
        
            


            
    <?php include("../DB/catalogoDB.php"); ?>
        <?php foreach ($comercial as $comercial): ?>
            <div class="itens <?= empty($comercial['link']) ? 'open-modal' : '' ?>"
              data-projeto-id="<?= $comercial['id']; ?>"
                data-image="<?= empty($comercial['link']) && !empty($comercial['imgModal_base64']) ? 'data:image/jpeg;base64,'.$comercial['imgModal_base64'] : 'data:image/jpeg;base64,'.$comercial['imagem_base64']; ?>">
                <?php if (!empty($comercial['link'])): ?>
                    <a href="<?= htmlspecialchars($comercial['link'], ENT_QUOTES, 'UTF-8'); ?>" target="_blank">
                        <img class="poster" src="data:image/jpeg;base64,<?= $comercial['imagem_base64']; ?>" alt="<?= htmlspecialchars($comercial['nome'], ENT_QUOTES, 'UTF-8'); ?>">
                    </a>
                <?php else: ?>
                    <img class="poster" src="data:image/jpeg;base64,<?= $comercial['imagem_base64']; ?>" alt="<?= htmlspecialchars($comercial['nome'], ENT_QUOTES, 'UTF-8'); ?>">
                <?php endif; ?>
                <h2><?= htmlspecialchars($comercial['nome'], ENT_QUOTES, 'UTF-8'); ?></h2>
            </div>
        <?php endforeach; ?>



     <!-- Modal para exibir a imagem -->
       <div id="myModal" class="modal">
            <div class="modal-content">
                <span class="closeModal">&times;</span>
                <img id="modalImg" src="" alt="Imagem do Projeto" style="width: 100%;">
            </div>
        </div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        
    <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
    <script>
            window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(function(OneSignal) {
                OneSignal.init({
                  appId: "64d0ab10-a576-486f-ba38-7ceb56cf160e",
                });
              });
            </script>
            
        </body>
        
    </header>
        
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

    <script src="../js/home.js"></script>
    <script src="../js/catalogo.js"></script>

    

    <script>
                //Função para abrir o modal com a imagem correta
            function openModal(imageSrc) {
                var modal = document.getElementById("myModal");
                var modalImg = document.getElementById("modalImg");
                
                if (modal && modalImg) {
                    modal.style.display = "block";
                    modalImg.src = imageSrc;
                }
            }

            // Configura o evento de clique para cada item do catálogo
            document.querySelectorAll('.itens').forEach(item => {
                item.addEventListener('click', function(e) {
                    // Checa se o projeto tem um link definido
                    var link = this.querySelector('a');

                    // Se não tiver link, ou seja, deve abrir o modal
                    if (!link || link.getAttribute('href') === 'javascript:void(0);') {
                        e.preventDefault(); // Prevenir ação padrão do navegador
                        var imageSrc = this.getAttribute('data-image');
                        openModal(imageSrc);
                    }
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
    </script>

    <script>
           $(document).ready(function() {
            setInterval(function() {
                $.ajax({
                    url: '../DB/envioSessao.php', // Certifique-se de que este é o caminho correto para o seu script PHP.
                    type: 'POST',
                    data: { sessionId: '<?= $sessionId; ?>' }, // Envie o ID da sessão para o servidor.
                    success: function(response) {
                        // Aqui você pode tratar a resposta do servidor se necessário.
                        // Por exemplo, você pode querer atualizar alguma parte da página com a resposta.
                        console.log(response); // Mostra a resposta do servidor no console do navegador.
                    },
                    error: function(xhr, status, error) {
                        // Aqui você pode tratar erros de comunicação se necessário.
                        console.error("Error: " + error); // Mostra o erro no console do navegador.
                    }
                });
            }, 1000); // Define o intervalo para cada segundo.
        });

    </script>

        <?php include '../footer.php'; ?>
  </body>
</html>
