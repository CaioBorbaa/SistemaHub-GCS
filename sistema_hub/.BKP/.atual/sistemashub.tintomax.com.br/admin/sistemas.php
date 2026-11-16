<?php 
session_start();
include("../seguranca/seguranca.php"); 

if (!administrador_logado()) {
    header("Location: ../login.php");
    exit;
}

include("../conexao/conexao.php");

try {
    $query = "SELECT ID, nome_server, status FROM servers";
    $stmt = $conexao->prepare($query);
    $stmt->execute();
    $sistemas = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // Tratamento de erro
    echo "Erro ao buscar sistemas: " . $e->getMessage();
    $sistemas = []; // Define sistemas como um array vazio em caso de erro
}

?>

<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="../css/sistemas.css"> 
    <link rel="stylesheet" type="text/css" href="../css/main.css"> 
    <link rel="stylesheet" type="text/css" href="../css/navbar.css">
    <link rel="stylesheet" type="text/css" href="../css/menu.css"> 
    <?php include '../header.php'; ?>


    <title>SISTEMAS ATIVOS</title>
</head>

<body>
    <header></header>

    <div class="containerDG">
        <div class="containerList">
            <div class="containerFundo">
                <!-- Iterar sobre os sistemas -->
                <?php foreach ($sistemas as $sistema): ?>
                    <div class="sistema" data-id="<?= $sistema['ID'] ?>">
                        <span class="sistema-nome"><?= htmlspecialchars($sistema['nome_server']) ?></span>
                        <div class="indicador <?= $sistema['status'] == 'ativo' ? 'ativo-indicador' : 'desativado-indicador' ?>"></div>
                        <button class="btn-Server <?= $sistema['status'] ?>" onclick="toggleStatus(event, this, '<?= $sistema['ID'] ?>')"><?= strtoupper($sistema['status']) ?></button>
                    </div>
                <?php endforeach; ?>
                </div>
        </div>
    </div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script>
        function toggleStatus(event, btn, idSistema) {
            event.preventDefault(); // Impede o formulário de ser enviado
            let novoStatus = btn.classList.contains('ativo') ? 'desativado' : 'ativo';

            // Faz uma chamada AJAX para atualizar o status no banco de dados
            $.ajax({
                url: '../DB/serverCheck.php',
                type: 'POST',
                data: {
                    'acao': 'toggleStatus', // Ação que você vai capturar no seu projetoDB.php
                    'ID': idSistema,
                    'novoStatus': novoStatus
                },
                success: function(response) {
                    // Atualiza a classe e o texto do botão baseado na resposta
                    if (novoStatus == 'ativo') {
                        $(btn).removeClass('desativado').addClass('ativo').text('ATIVAR');
                        $(btn).prev('.indicador').removeClass('desativado-indicador').addClass('ativo-indicador');
                    } else {
                        $(btn).removeClass('ativo').addClass('desativado').text('DESATIVADO');
                        $(btn).prev('.indicador').removeClass('ativo-indicador').addClass('desativado-indicador');
                    }
                }
            });
        }
    </script>
    <script src="../js/home.js"></script>
</body>
</html>
