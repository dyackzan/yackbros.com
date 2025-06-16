window.addEventListener('load', () => {
    document.querySelector('.grad-cap').style.animationPlayState = 'running';
    setTimeout(() => {
        confetti({
            particleCount: 400,
            spread: 360,
            origin: {y: 0.5}
        });
    }, 500);
});