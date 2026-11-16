<?php
include("../conexao/conexao.php");

$stmt = $conexao->query("SELECT COUNT(*) FROM sessoes_ativas WHERE ultima_atividade >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)");
$usuariosAtivos = $stmt->fetchColumn();

//echo "Usuários ativos nos últimos 5 minutos: " . $usuariosAtivos;

$stmt = $conexao->query("SELECT COUNT(*) FROM projetos"); // Substitua 'sistemas' pelo nome real da sua tabela
$totalProjetos = $stmt->fetchColumn();

$stmt = $conexao->query("SELECT COUNT(*) FROM sessoes_ativas"); // Assumindo que você registra cada acesso em uma tabela 'acessos'
$totalAcessos = $stmt->fetchColumn();


$stmt = $conexao->query("
    SELECT 
        projetos.id,
        projetos.nome,
        COUNT(projeto_cliques.projeto_id) AS acessos,
        projetos.imagem,
        projetos.link,
        projetos.ordem,
        projetos.imgModal
    FROM 
        projetos
    INNER JOIN 
        projeto_cliques 
    ON 
        projetos.id = projeto_cliques.projeto_id
    GROUP BY 
        projetos.id
    ORDER BY 
        acessos DESC, 
        projeto_cliques.data_hora DESC 
    LIMIT 5;
");
$sistemasMaisAcessados = $stmt->fetchAll();

// Consultar o número de sessões ativas (exemplo: ativas nos últimos 10 minutos)
$stmt = $conexao->prepare("SELECT COUNT(*) AS active_sessions FROM sessoes_ativas WHERE ultima_atividade >= (NOW() - INTERVAL 1 MINUTE)");
$stmt->execute();
$result = $stmt->fetch();


// Consulta para buscar os IPs ativos
$stmt = $conexao->prepare("SELECT ip FROM sessoes_ativas where ultima_atividade >= (NOW() - INTERVAL 5 MINUTE)");
$stmt->execute();
$ips = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Preparar a string dos IPs para exibição
$ipsString = '';
foreach ($ips as $ip) {
    $ipsString .= htmlspecialchars($ip['ip']) . "<br>"; // Adiciona cada IP à string com quebra de linha para HTML
}

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