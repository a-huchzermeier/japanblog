const audio = document.getElementById('hintergrundSound');
const button = document.getElementById('startBtn');

button.addEventListener('click', () => {
    audio.play().then(() => {
        console.log("Audio startet erfolgreich.");
        button.style.display = 'none'; // Versteckt den Button nach dem Klick
    }).catch(error => {
        console.error("Autoplay wurde blockiert:", error);
    });
});
