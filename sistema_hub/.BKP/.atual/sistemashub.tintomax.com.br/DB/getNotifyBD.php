<?php
include("../conexao/conexao.php"); // Inclui a conexão com o banco de dados
header('Content-Type: application/json');

$sql = "SELECT titulo, imagem, tipo_imagem FROM notificacao"; // Adiciona tipo_imagem à consulta
$stmt = $conexao->prepare($sql);

// Executa a consulta
if ($stmt->execute()) {
    // Verifica se algum resultado foi retornado
    if ($stmt->rowCount() > 0) {
        $notificacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($notificacoes as $key => $notificacao) {
            // Verifica se há uma imagem para a notificação atual
            if (!empty($notificacao['imagem'])) {
                // Usa o tipo MIME armazenado no banco de dados
                $tipo = $notificacao['tipo_imagem']; // Usa o tipo MIME da coluna tipo_imagem
                $base64 = base64_encode($notificacao['imagem']);
                $notificacoes[$key]['imagem'] = 'data:' . $tipo . ';base64,' . $base64;
            }
        }
        // Retorna as notificações em formato JSON
        echo json_encode($notificacoes);
    } else {
        echo json_encode(array("mensagem" => "Notificação não encontrada."));
    }
} else {
    echo json_encode(array("mensagem" => "Erro ao buscar notificação."));
}
?>
