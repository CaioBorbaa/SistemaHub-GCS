<?php 
session_start();
include("../seguranca/seguranca.php"); 

if (!administrador_logado()) {
    header("Location: ../login.php");
    exit;
}
?>

<html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" type="text/css" href="../css/main.css">
        <link rel="stylesheet" type="text/css" href="../css/cadProj.css">

        <title>Cadastro de Notificação</title>
    </head>
<body>


    <header>
                <nav class="navbar">
                    <!-- Seção Esquerda: Relógio -->
                    <div class="navbar-left">
                        <time>12:00:00</time>
                    </div>
                    
                    <!-- Seção Central: Logo -->
                    <div class="navbar-center">
                        <a href="admin.php">
                            <img src="../assets/logo.png" alt="Logo da Tintomax" class="logo">
                        </a>
                    </div>
        
                    <!-- Seção Direita: Outros Itens -->
                    <div class="navbar-right">
                        <div class="menu">
                            <div class="container">
                                <div class="toggle"></div>
                                </div>
                            </div>
                        </div>
                    </nav>
        
        
                <div class="menu">
                    <div class="container">
                        <div class="toggle"></div>
                        <span class="hidden"><a href="admin.php">Sistemas</a></span>
                    </div>
                </div>
              
            </header>

    <div class="containerDG">
        <div class="container-login">
            <div class="wrap-login">
                <form class="login-form" method="POST" action="../DB/cadNotifyBD.php" enctype="multipart/form-data"> 
                    <span class="login-form-title margin-bottom-35">Cadastro de Notificação</span>

                    <div class="wrap-input margin-bottom-35">
                        <input class="input-form" type="text" name="tituloNot">
                        <span class="focus-input-form" data-placeholder="Titulo da Notificação"></span>
                    </div>

                    <div class="wrap-input margin-bottom-35">
                        <!-- Campo de envio de arquivo para a imagem do projeto -->
                        <input class="input-form" type="file" name="imgNot" accept="image/*">
                        <span class="focus-input-form" data-placeholder=""></span>
                    </div>


                    <div class="container-login-form-btn">
                        <button class="login-form-btn" type="submit">enviar notificação</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>

    <!-- Scripts para interação dos inputs e funcionalidades adicionais -->
    <script src="../js/home.js"></script>

</body>
</html>
