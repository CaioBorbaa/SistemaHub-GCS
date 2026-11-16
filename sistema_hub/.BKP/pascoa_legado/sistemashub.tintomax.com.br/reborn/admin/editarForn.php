<?php 
session_start();
include("../seguranca/seguranca.php"); 

if (!administrador_logado()) {
    header("Location: ../login.php");
    exit;
}
?>
<html>

<head>
    <title>Catalogo de Sistemas</title>
    <link rel="stylesheet" href="../css/catalogo.css">
    <link rel="stylesheet" href="../css/menu.css">
    <?php include '../header.php'; ?>

    <link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css">
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
                        <div class="menu">
                            <div class="container">
                                <div class="toggle"></div>
                                <span class="hidden"><a href="admin.php">Sistemas</a></span>
                                <span class="hidden"><a href="../login.php">Sair</a></span>
                            </div>
                        </div>
                    </div>
                </nav>
        
        
    </header>
    
    <div class="loading-overlay"></div>

    <?php include("../DB/catalogoDB.php"); ?>
    <ul id="sortable">
        <?php foreach ($fornecedor as $fornecedor): ?>
            <li class="ui-state-default itens" data-id="<?php echo $fornecedor['id']; ?>">
                <a href="editar.php?id=<?php echo htmlspecialchars($fornecedor['id'], ENT_QUOTES, 'UTF-8'); ?>">
                    <img class="poster" src="data:image/jpeg;base64,<?php echo htmlspecialchars($fornecedor['imagem_base64'], ENT_QUOTES, 'UTF-8'); ?>" alt="<?php echo htmlspecialchars($fornecedor['nome'], ENT_QUOTES, 'UTF-8'); ?>">
                </a>
                <h2><?php echo htmlspecialchars($fornecedor['nome'], ENT_QUOTES, 'UTF-8'); ?></h2>
            </li>
        <?php endforeach; ?>
    </ul>   


  
    <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
    <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
    <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>

    <style>
        .loading {
            background-image: url('../assets/loading.gif');
            background-repeat: no-repeat;
            background-position: center;
            opacity: 1; 
        }

        .loading-overlay {
                position: fixed; /* Fixo na viewport */
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.7); /* Fundo levemente transparente */
                background-image: url('../assets/loading.gif');
                background-repeat: no-repeat;
                background-position: center center;
                background-size: 100px; /* Tamanho do GIF de carregamento */
                z-index: 9999; /* Garante que o overlay esteja acima de outros elementos */
                display: none; /* Oculto por padrão */
        }

            #sortable {
                list-style-type: none;
                margin: 0;
                padding: 0;
                width: 80%; /* Aumento da largura para facilitar o arrasto */
                margin: auto; /* Centraliza a lista na página */
            }

            #sortable li {
                margin: 10px 2%; /* Aumento da margem para melhor separação */
                padding: 5px; /* Aumento do padding para melhor estética */
                font-size: 1em; /* Ajuste do tamanho da fonte para melhor legibilidade */
                border: none;
                background-color: none; /* Cor de fundo mais suave */
                cursor: pointer; /* Cursor indica um elemento interativo */
                border-radius: 4px; /* Bordas arredondadas para estética moderna */
            }

            #sortable li.itens:hover {
                background-color: #eaeaea; /* Efeito hover para feedback visual */
            }

            #sortable li img.poster {
               /* width: 100%; /* Aumenta a largura da imagem */
              /*  height: 100%; /* Aumenta a altura da imagem */
                object-fit: cover; /* Garante que a imagem cubra o espaço sem distorcer */
                border-radius: 8px; /* Adiciona bordas arredondadas à imagem */
         
            }

    </style>

    

    <script>
        $(function() {
            $("#sortable").sortable({
                update: function(event, ui) {
                    var novaOrdem = $(this).sortable('toArray', {attribute: 'data-id'});
                    $.ajax({
                        url: '../DB/atualizarOrdem.php',
                        method: 'POST',
                        data: {
                            ordem: novaOrdem
                        },
                        beforeSend: function() {
                        // Adiciona a classe 'loading' ao elemento antes de enviar a requisição
                            $('.loading-overlay').show(); // Mostra o overlay de carregamento
                        },
                        complete: function() {
                            setTimeout(function() {
                                $('.loading-overlay').hide();
                            }, 400); // Ajuste o tempo (2000 ms = 2 segundos) conforme necessário
                        },
                        success: function(response) {
                            console.log("Ordem atualizada: ", response);
                 
                        },
                        error: function(xhr, status, error) {
                            console.error("Erro ao atualizar ordem: ", error);
                        }
                        });
                }
            });
            $("#sortable").disableSelection();
        });

    </script>
    
    <script>
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        OneSignalDeferred.push(function(OneSignal) {
        OneSignal.init({
            appId: "64d0ab10-a576-486f-ba38-7ceb56cf160e",
         });
     });
    </script> 

    <script src="../js/home.js"></script>
</body>
</html>
