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
    <?php include '../header.php'; ?>

    <title>Cadastro de Projetos</title>
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
                        <a href="">
                            <img src="../assets/logo.png" alt="Logo da Tintomax" class="logo">
                        </a>
                    </div>
        
                    <!-- Seção Direita: Outros Itens (exemplo com o menu) -->
                    <div class="navbar-right">
                        <div class="menu">
                            <div class="container">
                                <div class="toggle"></div>
                                <!-- Links ou outros elementos -->
                            </div>
                        </div>
                    </div>
                </nav>
        
        
                <div class="menu">
                    <div class="container">
                        <div class="toggle"></div>
                        <span class="hidden"><a href="admin.php">Sistemas</a></span>
                        <span class="hidden"><a href="admin.php">Admin</a></span>
                    </div>
                </div>
              
            </header>

    <div class="containerDG">
        <div class="container-login">
            <div class="wrap-login">
                <!-- Certifique-se de incluir 'enctype="multipart/form-data"' para o envio de arquivos -->
                <form class="login-form" method="POST" action="../DB/projetoDB.php" enctype="multipart/form-data"> 
                    <span class="login-form-title margin-bottom-35">Cadastro de Projetos</span>

                    <div class="wrap-input margin-bottom-35">
                        <input class="input-form" type="text" name="nomeProjeto" required autofocus>
                        <span class="focus-input-form" data-placeholder="Nome do Projeto"></span>
                    </div>

                    <div class="wrap-input margin-bottom-35">
                        <!-- Campo de envio de arquivo para a imagem do projeto -->
                        <input class="input-form" type="file" name="imgProjeto" accept="image/*" required>
                        <span class="focus-input-form" data-placeholder=""></span>
                    </div>

                    <div class="wrap-input margin-bottom-35">
                        <input class="input-form" type="text" name="linkProjeto">
                        <span class="focus-input-form" data-placeholder="Link do Projeto"></span>
                    </div>
                    
                    <!-- Projeto checkbox -->
                    <label class="checkbox-container">Projeto
                        <input type="checkbox" class="input-form" name="tipoProj" id="projetos" value="projetos">
                        <span class="checkmark"></span>
                    </label>
                    
                    <!-- Fornecedor checkbox -->
                    <label class="checkbox-container">Fornecedor
                        <input type="checkbox" class="input-form" name="tipoProj" id="fornecedor" value="fornecedor">
                        <span class="checkmark"></span>
                    </label>

                     <!-- Fornecedor comercial -->
                     <label class="checkbox-container">Comercial
                        <input type="checkbox" class="input-form" name="tipoProj" id="comercial" value="comercial">
                        <span class="checkmark"></span>
                    </label>

                    <div class="container-login-form-btn">
                        <button class="login-form-btn" type="submit">Cadastrar Projeto</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>


    <!-- Scripts para interação dos inputs e funcionalidades adicionais -->
    <script src="../js/home.js"></script>
    
    <script>
            document.addEventListener('DOMContentLoaded', () => {
            const checkboxes = document.querySelectorAll('.input-form');

            checkboxes.forEach((checkbox) => {
                checkbox.addEventListener('change', function() {
                    if(this.checked) {
                        checkboxes.forEach((box) => {
                            if(box !== this) {
                                box.checked = false;
                            }
                        });
                    }
                });
            });
        });
    </script>

</body>
</html>
