<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    <link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>

    <div class="container">
        <h1>Calculadora de Tinta</h1>
        <div id="warningMessage" style="color: red; display: none;"></div>
        <form id="paintCalcForm">
            <div id="wallsContainer"></div>
        </form>
        <div id="result"></div>
        <div class="button-wrapper"> 
            <button class="btn fill"onclick="addWall()">Adicionar Parede</button>
            <button class="btn fill" onclick="calculatePaint()">Calcular</button>
        </div>
        <div class="div-select">
            <label class="tipoTINTA" for="tipoTinta">Tipo de Tinta:</label>
            <select id="tipoTinta">
                <option value="1">Acrílica</option>
                <option value="2">Brilhante</option>
                <option value="3">Latex</option>
            </select>
        </div>
    </div>

    <?php include("assets/layout/footer.php")?>

    <script src="components/calcular.js"></script>
</body>
</html> 





