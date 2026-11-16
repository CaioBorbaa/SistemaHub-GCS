<?php
include("../conexao/conexao.php"); // Certifique-se de que o caminho para a conexão esteja correto
include("../seguranca/seguranca.php");

//seguranca_adm(); // Chama a função de segurança, se necessário

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Recebe os dados do formulário
    $nomeProjeto = $_POST['nomeProjeto'];
    $linkProjeto = $_POST['linkProjeto'];

    // Identifica qual checkbox foi selecionado
    $tipoProjeto = isset($_POST['tipoProj']) ? $_POST['tipoProj'] : '';


    // Verificar e preparar o arquivo de imagem para upload
    if (isset($_FILES["imgProjeto"]) && $_FILES["imgProjeto"]["error"] == 0) {
        $fileType = pathinfo($_FILES["imgProjeto"]["name"], PATHINFO_EXTENSION);

        // Permitir apenas certos formatos de arquivo
        $allowTypes = array('jpg', 'png', 'jpeg', 'gif');
        if (in_array($fileType, $allowTypes)) {
            // Ler o conteúdo do arquivo
            $imgContent = file_get_contents($_FILES['imgProjeto']['tmp_name']);

            // Inserir dados no banco de dados, incluindo os dados binários da imagem
            $sql = "INSERT INTO projetos (nome, imagem, link, tipo) VALUES (?, ?, ?, ?)";
            $stmt = $conexao->prepare($sql);
            $stmt->bindParam(1, $nomeProjeto);
            $stmt->bindParam(2, $imgContent, PDO::PARAM_LOB);
            $stmt->bindParam(3, $linkProjeto);
            $stmt->bindParam(4, $tipoProjeto);

            if ($stmt->execute()) {
                header("Location: ../admin/admin.php"); // Redireciona para a página de administração
                exit; // Garante que o script PHP seja encerrado após o redirecionamento
            } else {
                echo "Erro ao cadastrar o projeto.";
            }
        } else {
            echo "Erro: Formato de arquivo não permitido.";
        }
    } else {
        echo "Erro: Falha ao fazer upload do arquivo.";
    }
}
?>
