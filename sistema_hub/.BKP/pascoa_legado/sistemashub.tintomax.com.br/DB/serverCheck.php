<?php
session_start();
include("../seguranca/seguranca.php"); 
include("../conexao/conexao.php");

// Verifica se o usuário está logado
if (!administrador_logado()) {
    echo json_encode(['status' => 'error', 'message' => 'Acesso negado']);
    exit;
}

// Verifica se há uma ação definida
if (isset($_POST['acao']) && $_POST['acao'] == 'toggleStatus') {
    // Verifica se os dados necessários foram enviados
    if (isset($_POST['ID'], $_POST['novoStatus'])) {
        $id = $_POST['ID'];
        $novoStatus = $_POST['novoStatus'] == 'ativo' ? 'ativo' : 'inativo'; // Validação básica

        // Prepara e executa a consulta para atualizar o status do sistema
        $sql = "UPDATE servers SET status = :novoStatus WHERE ID = :ID";
        $stmt = $conexao->prepare($sql);
        $stmt->bindParam(':novoStatus', $novoStatus, PDO::PARAM_STR);
        $stmt->bindParam(':ID', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            // Se a atualização foi bem-sucedida, retorna uma resposta positiva
            echo json_encode(['status' => 'success', 'message' => 'Status atualizado com sucesso', 'novoStatus' => $novoStatus]);
        } else {
            // Se houve um erro na atualização, retorna uma resposta de erro
            echo json_encode(['status' => 'error', 'message' => 'Erro ao atualizar o status']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Dados incompletos']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Ação não definida']);
}
?>
