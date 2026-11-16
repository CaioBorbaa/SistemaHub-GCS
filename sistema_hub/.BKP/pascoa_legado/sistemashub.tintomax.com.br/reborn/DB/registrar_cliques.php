<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

session_start();
include("../conexao/conexao.php"); 

$data = json_decode(file_get_contents('php://input'), true);
echo "Script está funcionando";

//verifica o projeto id e o tipo do projeto(fornecedor ou projetos)
if (isset($data['projetoId'], $data['tipo'])) {
    $projetoId = $data['projetoId'];
    $tipo = $data['tipo'];
    $ip = $_SERVER['REMOTE_ADDR'];
    $sessaoId = session_id();

    // Preparar e executar a inserção no banco de dados
    $stmt = $conexao->prepare("INSERT INTO projeto_cliques (projeto_id, tipo, ip, sessao_id) VALUES (?, ?, ?, ?)");
    $stmt->execute([$projetoId, $tipo, $ip, $sessaoId]);

    echo json_encode(['status' => 'success', 'message' => 'Clique registrado']);

}
?>
