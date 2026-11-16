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
            <link rel="stylesheet" href="../css/teste.css">
            <link rel="icon" type="image/png" sizes="16x16" href="../favicon/favicon-16x16.png">
            <link rel="icon" type="image/png" sizes="32x32" href="../favicon/favicon-32x32.png">
            <link rel="icon" type="image/png" sizes="192x192" href="../favicon/android-chrome-192x192.png">
            <link rel="icon" type="image/png" sizes="512x512" href="../favicon/android-chrome-512x512.png">
            <link rel="apple-touch-icon" sizes="180x180" href="../favicon/apple-touch-icon.png">
            <link rel="manifest" href="../favicon/site.webmanifest">
            <link rel="mask-icon" href="../favicon/safari-pinned-tab.svg" color="#5bbad5">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" integrity="sha384-k6vP0kho8NpUGhRy3Efe7625hDjvbN3yL8Ea2SPLhrp9b4KzB+K9rTBHdK1S5YmE" crossorigin="anonymous">
            <meta name="msapplication-TileColor" content="#da532c">
            <meta name="theme-color" content="#ffffff">
            <meta name='robots' content='noindex, nofollow'/>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <meta http-equiv="refresh" content="3600">
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
                        <a href="">
                            <img src="../assets/logo.png" alt="Logo da Tintomax" class="logo">
                        </a>
                    </div>
        
                    <!-- Seção Direita: Outros Itens (exemplo com o menu) -->
                    <div class="navbar-right">
                        <div class="vazio">
                            <div class="vazio2">
                                <a href="../usuario/fornecedores.php" class="area-comercial-btn">ÁREA COMERCIAL</a>
                            </div>
                        </div>
                    </div>
                </nav>
        

              
            </header>
        
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

            


    <div id="notificationModal" class="modalNot" style="display:none;"> <!-- Modal inicialmente oculto -->
            <button class="close-button-Not">&times;</button>
                <div class="image-container">
                    <div class="modal-content-Not">
                    <div class="titleNot" id="modalTitleNot"></div>
                  <img id="modalImageNot" src="" alt="" style="max-width: 100%;">
               </div>
        </div>
     </div>


            
    <?php include("../DB/catalogoDB.php"); ?>
        <?php foreach ($projetos as $projeto): ?>
            <div class="itens <?= empty($projeto['link']) ? 'open-modal' : '' ?>"
              data-projeto-id="<?= $projeto['id']; ?>"
                data-image="<?= empty($projeto['link']) && !empty($projeto['imgModal_base64']) ? 'data:image/jpeg;base64,'.$projeto['imgModal_base64'] : 'data:image/jpeg;base64,'.$projeto['imagem_base64']; ?>">
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

       

            <div class="containerCat">
            <div class="shadow"></div>
            <div class="cat">
                <div class="ear"></div>
                <img class="eyeClose "src="../assets/olho.png"></img>
                <div class="eye"></div>
                <div class="mouth"></div>
                <div class="nose"></div>
                <div class="tail"></div>
                <div class="body"></div>
                <div class="bubble"></div>
            </div>
        </div>

        <

       


     <!-- Modal para exibir a imagem -->
       <div id="myModal" class="modal">
            <div class="modal-content">
                <span class="closeModal">&times;</span>
                <img id="modalImg" src="" alt="Imagem do Projeto" style="width: 100%;">
            </div>
        </div>

        <script>
            document.querySelector('.cat').addEventListener('click', function() {
                var eyeClose = document.querySelector('.eyeClose'); // Seleciona o elemento do olho aberto
                var eye = document.querySelector('.eye'); // Seleciona o elemento do olho fechado

                // Verifica se o olho aberto está sendo mostrado
                if (eyeClose.style.display === 'none' || eyeClose.style.display === '') {
                    eyeClose.style.display = 'block'; // Mostra o olho aberto
                    eye.style.display = 'none'; // Esconde o olho fechado
                } else {
                    eyeClose.style.display = 'none'; // Esconde o olho aberto
                    eye.style.display = 'block'; // Mostra o olho fechado
                }
            });
        </script>


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
            
    </header>
        
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

    <script src="../js/home.js"></script>
    <script src="../js/notify.js"></script>
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
