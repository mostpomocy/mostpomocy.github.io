<?php
// Ten plik po prostu wyświetli kod, który wyśle do Ciebie Allegro
if (isset($_GET['code'])) {
    echo "Twój kod autoryzacyjny to: " . htmlspecialchars($_GET['code']);
} else {
    echo "Brak kodu w adresie URL.";
}
?>
