<?php
include("../conexao/conexao.php"); // Inclui a conexão com o banco de dados

// Verifica se o formulário foi submetido
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['projetoId'])) {
    $projetoId = $_POST['projetoId'];
    $nomeProjeto = $_POST['nomeProjeto'];
    $linkProjeto = $_POST['linkProjeto'] ?? null; // Usa null como padrão se não for fornecido

    // Inicializa a variável $imagem com null
    $imagem = null;

    // Verifica se um arquivo foi enviado
    if (isset($_FILES['imgProjeto']) && $_FILES['imgProjeto']['error'] == 0) {
        $imagemTemp = $_FILES['imgProjeto']['tmp_name'];
        $imagem = file_get_contents($imagemTemp); // Lê o arquivo da imagem
    }

    // Prepara a consulta SQL
    if ($imagem) {
        // Se uma nova imagem foi enviada, inclui a imagem na atualização
        $sql = "UPDATE projetos SET nome = :nome, link = :link, imagem = :imagem WHERE id = :id";
        $stmt = $conexao->prepare($sql);
        $stmt->execute(['nome' => $nomeProjeto, 'link' => $linkProjeto, 'imagem' => $imagem, 'id' => $projetoId]);
    } else {
        // Verifica se um novo link foi fornecido
        if (!empty($linkProjeto)) {
            // Atualiza nome e link, mas não a imagem
            $sql = "UPDATE projetos SET nome = :nome, link = :link WHERE id = :id";
            $stmt = $conexao->prepare($sql);
            $stmt->execute(['nome' => $nomeProjeto, 'link' => $linkProjeto, 'id' => $projetoId]);
        } else {
            // Atualiza apenas o nome se nenhum link novo for fornecido
            $sql = "UPDATE projetos SET nome = :nome WHERE id = :id";
            $stmt = $conexao->prepare($sql);
            $stmt->execute(['nome' => $nomeProjeto, 'id' => $projetoId]);
        }
    }

    // Redireciona após a atualização
    header("Location: ../admin/admin.php");
    exit;
} else {
    // Redireciona se o método não for POST ou se o ID do projeto não for fornecido
    header("Location: ../error.php"); // Ajuste para a página de erro ou formulário apropriado
    exit;
}
?>
