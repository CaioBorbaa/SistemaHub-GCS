<?php
include("../conexao/conexao.php"); // Caminho para a conexão com o banco de dados

// Consulta SQL para selecionar os campos necessários da tabela de projetos
$sql = "SELECT nome, imagem, link, imgModal, id, tipo FROM projetos ORDER BY ordem ASC";

$stmt = $conexao->query($sql);

$projetos = [];
$fornecedor = [];
$comercial = [];


// Verifica se a consulta retornou linhas
if ($stmt->rowCount() > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Processa a imagem do projeto
        if (!empty($row['imagem'])) {
            $row['imagem_base64'] = base64_encode($row['imagem']);
        } else {
            // Define um valor padrão ou mantém nulo/omitido
            $row['imagem_base64'] = null;
        }

        /*
        // Processa a imagem do modal, se existir
        if (!empty($row['imgModal'])) {
            $row['imgModal_base64'] = base64_encode($row['imgModal']);
        } else {
            // Define um valor padrão ou mantém nulo/omitido
            $row['imgModal_base64'] = null;
        }*/

        // Remove as colunas de imagem originais para reduzir o tamanho do payload
        unset($row['imagem']);

         // Adiciona o projeto processado ao array de projetos
         if ($row['tipo'] == 'projetos') { // Mudança feita aqui: '==' usado para comparação
            $projetos[] = $row;
        } else if ($row['tipo'] == 'fornecedor') {
            $fornecedor[] = $row;
        } else if($row['tipo' ] == 'comercial'){
            $comercial[] = $row;
        }
        
    }
} else {
    // Mensagem opcional caso não haja projetos
    echo "Nenhum projeto encontrado.";
}

?>
