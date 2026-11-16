<?php 
session_start();
include("../seguranca/seguranca.php"); 

if (!administrador_logado()) {
    header("Location: ../login.php");
    exit;
}

include("../DB/relatorioUsers.php");

?>

<html>
        <head>
             <!-- Define as configurações do cabeçalho da página, como título e links para folhas de estilo -->
            <title>Catalogo de Sistemas</title>
            <link rel="stylesheet" href="../css/catalogo.css">
            <link rel="stylesheet" href="../css/menu.css">
            <link rel="stylesheet" href="../css/dashboard.css">
            <link rel="icon" type="image/png" sizes="16x16" href="../favicon/favicon-16x16.png">
            <link rel="icon" type="image/png" sizes="32x32" href="../favicon/favicon-32x32.png">
            <link rel="icon" type="image/png" sizes="192x192" href="../favicon/android-chrome-192x192.png">
            <link rel="icon" type="image/png" sizes="512x512" href="../favicon/android-chrome-512x512.png">
            <link rel="apple-touch-icon" sizes="180x180" href="../favicon/apple-touch-icon.png">
            <link rel="manifest" href="../favicon/site.webmanifest">
            <link rel="mask-icon" href="../favicon/safari-pinned-tab.svg" color="#5bbad5">
            <meta name="msapplication-TileColor" content="#da532c">
            <meta name="theme-color" content="#ffffff">
            <meta name='robots' content='noindex, nofollow'/>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
            <meta http-equiv="refresh" content="60">
        </head>
        <body>
            <header>
                <!-- Estrutura da barra de navegação com seções para relógio, logo e outros itens -->
                <nav class="navbar">
                    <!-- Seção Esquerda: Relógio -->
                    <div class="navbar-left">
                        <time>12:00:00</time>
                    </div>
                    
                    <!-- Seção Central: Logo -->
                    <div class="navbar-center">
                        <a href="">
                            <img src="../assets/logo.png" alt="Logo da Tintomax" class="logo">
                        </a>
                    </div>
        
                    <!-- Seção Direita: Outros Itens -->
                    <div class="navbar-right">
               
                    </div>
                </nav>

                <div class="menu">
                                <div class="container">
                                    <!-- Botão para alternar o menu (responsivo) -->
                                    <div class="toggle"></div>
                                    <span class="hidden"><a href="cadastroProj.php">Cadastrar</a></span>
                                    <span class="hidden"><a href="editarProjs.php">Editar</a></span>
                                    <span class="hidden"><a href="cadNotify.php">Notificações</a></span>
                                    <span class="hidden"><a href="../login.php">Sair</a></span>
                                </div>
                        </div>
        
        
                <div class="admin-dashboard">
           <!-- Widgets mostrando diferentes métricas como total de projetos, acessos, usuários ativos, etc. -->
                    <div class="dashboard-widgets">
   
                          <!-- Linha 1: Total de Projetos, Total de Acessos, Usuários ativos, Sessões ativas -->
                            <div class="widget widget-total">
                                <h3>Total de Projetos</h3>
                                <p><?php echo $totalProjetos ?></p>
                            </div>

                            <div class="widget widget-acessos">
                                <h3>Total de Acessos</h3>
                                <p><?php echo $totalAcessos ?></p>
                            </div>

                            <div class="widget widget-acessos">
                                <h3>Usuários ativos nos últimos 30 minutos</h3>
                                <p><?php echo $usuariosAtivos ?></p>
                            </div>

                            <div class="widget widget-acessos">
                                <h3>Sessões ativas no momento</h3>
                                <p><?php echo $result['active_sessions']; ?></p>
                            </div>
                        
                        <!-- Linha 2: IPs ativos, Projetos Mais Acessados, Status dos Sistemas, Gráfico -->
                     
                        <div class="widget widget-ip">
                            <h3>IPs ativos no momento</h3>
                            <p><?php echo $ipsString; ?></p>
                        </div>

                        <div class="widget widget-projetos">
                            <h3>Projetos Mais Acessados</h3>
                            <ul class="acessos-lista">
                                <?php foreach ($sistemasMaisAcessados as $sistema): ?>
                                    <li class="acessos-item">
                                        <span class="projeto-nome"><?= htmlspecialchars($sistema['nome']); ?></span>
                                        <span class="projeto-acessos">(<?= $sistema['acessos']; ?> acessos)</span>
                                        <?php if (!empty($sistema['imagem'])): ?>
                                            <!-- Converter a imagem BLOB para Base64 para exibição -->
                                            <img src="data:image/jpeg;base64,<?= base64_encode($sistema['imagem']); ?>" alt="<?= htmlspecialchars($sistema['nome']); ?>" class="projeto-imagem">
                                        <?php endif; ?>
                                        <?php if (!empty($sistema['link'])): ?>
                                            <a href="<?= htmlspecialchars($sistema['link']); ?>" target="_blank" class="projeto-link">Ver Projeto</a>
                                        <?php endif; ?>
                                        <?php if (empty($sistema['link'])): ?>
                                            <a href="" target="_blank" class="projeto-link">Ver Modal</a>
                                        <?php endif; ?>
                                    </li>
                                <?php endforeach; ?>
                            </ul>
                        </div>

                        <div class="widget widget-status">
                            <h3>Status dos Sistemas</h3>
                            <?php foreach ($sistemas as $sistema): ?>
                                <div class="sistema-status">
                                    <span class="sistema-nome"><?= htmlspecialchars($sistema['nome_server']); ?></span>
                                    <div class="sistema-indicador <?= $sistema['status'] == 'ativo' ? 'ativo' : 'inativo'; ?>"></div>
                                    <span class="sistema-estado"><?= $sistema['status'] == 'ativo' ? 'Ativo' : 'Inativo'; ?></span>
                                </div>
                            <?php endforeach; ?>
                        </div>

                        
                       

                        <div class="widget widget-grafico">
                            <canvas id="graficoSetoresAcessos" width="400" height="400"></canvas>
                        </div>

                    </div>
                </div>
              
            </header>
        

            <!-- Scripts para funcionalidades adicionais como notificações, gráficos e atualizações -->
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
            <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
            <script>
              window.OneSignalDeferred = window.OneSignalDeferred || [];
              OneSignalDeferred.push(function(OneSignal) {
                OneSignal.init({
                  appId: "64d0ab10-a576-486f-ba38-7ceb56cf160e",
                });
              });
            </script>
             <?php include '../footer.php'; ?>
        </body>
        </html>
        
    </header>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

        
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

    <script>
    var nomesProjetos = [];
    var acessosProjetos = [];
    // Defina as cores para combinar com o seu design
    var coresFundo = [
        'rgb(0, 72, 255)', // Azul mais forte
        'rgb(255, 102, 0)',  // Laranja mais forte
        'rgb(32, 244, 0)',  // Verde mais forte
        'rgb(190, 40, 255)', // Roxo mais forte
        'rgb(255, 0, 0)', //vermelho
        // Adicione mais cores conforme necessário
    ];
    var coresBorda = [
        'rgb(0, 72, 255)', // Azul borda
        'rgb(255, 102, 0)',  // Laranja borda
        'rgb(32, 244, 0)', // Verde borda
        'rgb(190, 40, 255)',// Roxo borda
        'rgb(255, 0, 0)'
        // Adicione mais cores conforme necessário
    ];

    <?php 
        $contagemMaxima = 5; // Limite de projetos a serem exibidos
        foreach ($sistemasMaisAcessados as $index => $sistema):
            if ($index >= $contagemMaxima) break;?> // Sai do loop após 5 projetos
            nomesProjetos.push("<?php echo $sistema['nome']; ?>");
            acessosProjetos.push(<?php echo $sistema['acessos']; ?>);
            var corIndex = <?php echo $index; ?> % coresFundo.length;
            coresFundo.push(coresFundo[corIndex]);
            coresBorda.push(coresBorda[corIndex]);
      <?php endforeach;?>
</script>

<script>
    var ctx = document.getElementById('graficoSetoresAcessos').getContext('2d');
    var graficoSetoresAcessos = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: nomesProjetos,
            datasets: [{
                data: acessosProjetos,
                backgroundColor: coresFundo,
                borderColor: coresBorda,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom', //margin de baixo
                    labels: {
                        color: '#333', // Cor do texto da legenda
                    }
                },
                title: {
                    display: true,
                    text: 'Sistemas Mais Acessados',
                    color: '#0056b3', // Cor do título
                    font: {
                        size: 20
                    }
                }
            },
            // Adicione esta parte para definir a cor de fundo para branco
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 80,
                    bottom: 00
                }
            }
        }
    });
</script>
    <script src="../js/home.js"></script>