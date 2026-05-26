// Busca todas las tarjetas informativas de la pagina "Sobre nosotros".
const infoCards = document.querySelectorAll('.info-card');

// A cada tarjeta se le agregan eventos de mouse para destacar la tarjeta activa.
infoCards.forEach(activeCard => {
    // Cuando el puntero entra a una tarjeta, esa tarjeta se resalta y las demas bajan su presencia visual.
    activeCard.addEventListener('mouseenter', () => {
        infoCards.forEach(card => {
            if (card === activeCard) {
                card.classList.add('info-card--is-active');
            }   else {
                card.style.opacity = '0.35';
                card.style.filter = 'blur(1.5px)';
            }
        });
    });

    // Cuando el puntero sale, todas las tarjetas vuelven a su estado normal.
    activeCard.addEventListener('mouseleave', () => {
        infoCards.forEach(card => {
            card.classList.remove('info-card--is-active');
            card.style.opacity = '1';
            card.style.filter = 'none';
        });

    });
});
