<?php
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    die("Acceso no permitido.");
}

// Recibir datos del formulario
$titulo = $_POST['titulo'] ?? '';
$descripcion = $_POST['descripcion'] ?? '';
$categoria = $_POST['categoria'] ?? ''; // NUEVO: categoría de la herramienta

// Validación básica
if (!$titulo || !$descripcion || !$categoria || !isset($_FILES['imagen']) || !isset($_FILES['modelo'])) {
    die("Faltan datos obligatorios.");
}

// Rutas correctas
$projectDir = dirname(__DIR__); // sube 1 nivel
$uploadDir = $projectDir . '/uploads/';
$dataFile = $projectDir . '/data/herramientas.json';

// Crear carpetas si no existen
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}
if (!file_exists(dirname($dataFile))) {
    mkdir(dirname($dataFile), 0777, true);
}
if (!file_exists($dataFile)) {
    file_put_contents($dataFile, json_encode([], JSON_PRETTY_PRINT));
}

// Función para validar tipo de archivo
function validarArchivo($archivo, $tiposPermitidos) {
    $ext = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
    return in_array($ext, $tiposPermitidos);
}

// Validar imagen
if (!validarArchivo($_FILES['imagen'], ['jpg','jpeg','png','gif','webp'])) {
    die("Tipo de imagen no permitido.");
}

// Validar modelo 3D
if (!validarArchivo($_FILES['modelo'], ['glb','obj','stl'])) {
    die("Tipo de archivo 3D no permitido.");
}

// Guardar imagen
$imagenNombre = time() . '_' . basename($_FILES['imagen']['name']);
move_uploaded_file($_FILES['imagen']['tmp_name'], $uploadDir . $imagenNombre);

// Guardar modelo 3D
$modeloNombre = time() . '_' . basename($_FILES['modelo']['name']);
move_uploaded_file($_FILES['modelo']['tmp_name'], $uploadDir . $modeloNombre);

// Guardar datos en JSON
$herramientas = json_decode(file_get_contents($dataFile), true);

$herramientas[] = [
    "titulo" => $titulo,
    "descripcion" => $descripcion,
    "categoria" => $categoria, // NUEVO
    "imagen" => "../uploads/" . $imagenNombre,
    "modelo" => "../uploads/" . $modeloNombre
];

// Guardar JSON actualizado
file_put_contents($dataFile, json_encode($herramientas, JSON_PRETTY_PRINT));

echo "Herramienta subida correctamente.";
?>
