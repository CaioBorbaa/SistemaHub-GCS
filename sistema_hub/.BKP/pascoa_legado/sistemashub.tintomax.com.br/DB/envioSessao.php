<?php
include("../conexao/conexao.php");

// Inicia a sessão se ainda não foi iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verifique se o sessionId foi enviado via POST
if (!isset($_POST['sessionId'])) {
    die('Session ID is missing from the POST request.');
}
$sessionId = $_POST['sessionId']; // Receber o ID da sessão do pedido via POST

// Atualizar o registro da sessão com a nova última atividade
$updateStmt = $conexao->prepare("UPDATE sessoes_ativas SET ultima_atividade = CURRENT_TIMESTAMP WHERE sessao_id = ?");
$updateStmt->execute([$sessionId]);


?>
