const infoCards = document.querySelectorAll('.info-card');

infoCards.forEach(activeCard => {
    //Puntero sobre la card
    activeCard.addEventListener('mouseenter', () => {
        infoCards.forEach(card => {
            if (card === activeCard) {
                card.classList.add('info-card--is-active'); //se conecta con la clase info-card--is-active del CSS
            }   else {
                card.style.opacity = '0.35'; //Resalta la card tocada por el puntero mientras da opacidad a las que no
                card.style.filter = 'blur(1.5px';//Marca la cantidad de blur que aplica a las cards no tocadas por el puntero
            }
        });
    });
    activeCard.addEventListener('mouseleave', () => {
        infoCards.forEach(card => {
            card.classList.remove('info-card--is-active');
            card.style.opacity = '1'; //Restablece la opacidad original de las cards al quitar el puntero repitiendo el bucle
            card.style.filter = 'none';
        });

    });
});