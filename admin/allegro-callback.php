<?php
// Sprawdzamy czy Allegro przesłało kod
if (isset($_GET['code'])) {
    $code = htmlspecialchars($_GET['code']);
    echo "<h1>Autoryzacja zakończona sukcesem!</h1>";
    echo "<p>Twój kod autoryzacyjny to:</p>";
    echo "<textarea style='width:100%; height:100px;'>" . $code . "</textarea>";
    echo "<p>Skopiuj ten kod i wklej go do swojego skryptu w Pythonie, aby pobrać token.</p>";
} elseif (isset($_GET['error'])) {
    echo "<h1>Błąd autoryzacji:</h1>";
    echo "<p>" . htmlspecialchars($_GET['error']) . "</p>";
} else {
    echo "<h1>Brak kodu.</h1>";
    echo "<p>Upewnij się, że wchodzisz na ten adres przez link wygenerowany w Allegro.</p>";
}
?>
