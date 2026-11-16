<?php
// Inicia a sessão
session_start();

// Verifica se existe uma sessão e a destrói
if (isset($_SESSION)) {
    session_unset(); // Remove todas as variáveis de sessão
    session_destroy(); // Destrói a sessão
}
?>

<!DOCTYPE html>
<html lang="pt-br">
<head>
    <title>Login - HUB</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="css/main.css">
</head>
<body>
    <div class="container">
        <div class="container-login">
            <div class="wrap-login-and-image">
                
                <div class="logBox">
                    <form class="login-form" id="systemLogin" method="POST" action="DB/loginDB.php">
                        <span class="login-form-title">Login</span>

                        <div class="wrap-input margin-top-35 margin-bottom-35">
                            <input class="input-form" type="text" name="txtEmailLogin" id="loginEmail" autocomplete="off" required autofocus>
                            <span class="focus-input-form" data-placeholder="Login"></span>
                        </div>

                        <div class="wrap-input margin-bottom-35">
                            <input class="input-form" type="password" name="txtSenhaLogin" id="loginSenha" required>
                            <span class="focus-input-form" data-placeholder="Senha"></span>
                        </div>

                        <div class="container-login-form-btn">
                            <button class="login-form-btn" type="submit">Login</button>
                        </div>
                    </form>      
                </div>

                <div class="imgLogg">
                        <img class="imgLogin" src="assets/login.png"/>
                </div>

            </div>
        </div>
    </div>

    <!-- Scripts para interação dos inputs e funcionalidades adicionais -->
    <script>
        let inputs = document.getElementsByClassName('input-form');
        for (let input of inputs) {
            input.addEventListener("blur", function() {
                if (input.value.trim() != "") {
                    input.classList.add("has-val");
                } else {
                    input.classList.remove("has-val");
                }
            });
        }
    </script>
</body>
</html>
