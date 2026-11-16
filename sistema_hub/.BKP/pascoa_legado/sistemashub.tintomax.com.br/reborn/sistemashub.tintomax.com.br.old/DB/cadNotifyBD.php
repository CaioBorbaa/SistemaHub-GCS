<?php
include("../conexao/conexao.php"); // Certifique-se de que o caminho para a conexão esteja correto
include("../seguranca/seguranca.php");

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $tituloNot = $_POST['tituloNot'];
    if($tituloNot != "") {
    // Verificar e preparar o arquivo de imagem para upload
    if (isset($_FILES["imgNot"]) && $_FILES["imgNot"]["error"] == 0) {
        $fileType = pathinfo($_FILES["imgNot"]["name"], PATHINFO_EXTENSION);

        // Definir o tipo MIME com base na extensão do arquivo
        $mimeTypes = [
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif'
        ];

        // Permitir apenas certos formatos de arquivo
        if (array_key_exists($fileType, $mimeTypes)) {
            // Ler o conteúdo do arquivo
            $imgContent = file_get_contents($_FILES['imgNot']['tmp_name']);
            $tipoImagem = $mimeTypes[$fileType]; // Obtém o tipo MIME correspondente

            // Inserir dados no banco de dados, incluindo os dados binários da imagem e o tipo MIME
            $sql = "UPDATE notificacao SET titulo = ?, imagem = ?, tipo_imagem = ? WHERE ID = 1";
            $stmt = $conexao->prepare($sql);
            $stmt->bindParam(1, $tituloNot);
            $stmt->bindParam(2, $imgContent, PDO::PARAM_LOB);
            $stmt->bindParam(3, $tipoImagem);

            if ($stmt->execute()) {
                header("Location: ../admin/admin.php");
            } else {
                echo "Erro ao cadastrar a notificação.";
            }
        } else {
            echo "Erro: Formato de arquivo não permitido.";
        }
    } else {
        echo "Erro: Falha ao fazer upload do arquivo.";
    }
    } else {
        header("Location: ../admin/admin.php");
    }
}
?>
