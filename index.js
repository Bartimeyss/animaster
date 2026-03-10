

function animaster() {
    const animaster = {
        fadeIn(element, duration) {
            element.style.transitionDuration = `${duration}ms`;
            element.classList.remove('hide');
            element.classList.add('show');
        },

        fadeOut(element, duration) {
            element.style.transitionDuration = `${duration}ms`;
            element.classList.remove('show');
            element.classList.add('hide');
        },

        move(element, duration, translation) {
            element.style.transitionDuration = `${duration}ms`;
            element.style.transform = getTransform(translation, null);
        },

        scale(element, duration, ratio) {
            element.style.transitionDuration = `${duration}ms`;
            element.style.transform = getTransform(null, ratio);
        },

        moveAndHide(element, duration) {
            const moveTime = duration * 2 / 5;
            const fadeTime = duration * 3 / 5;

            this.move(element, moveTime, {x: 100, y: 20});

            setTimeout(() => {
                this.fadeOut(element, fadeTime);
            }, moveTime);
        },

        showAndHide(element, duration) {
            const part = duration / 3;

            this.fadeIn(element, part);

            setTimeout(() => {
                this.fadeOut(element, part);
            }, part * 2);
        }
    }

    return animaster;
}

addListeners();

function addListeners() {
    const animasterInstance = animaster();
    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animasterInstance.fadeIn(block, 5000);
        });

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animasterInstance.move(block, 1000, {x: 100, y: 10});
        });

    document.getElementById('scalePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animasterInstance.scale(block, 1000, 1.25);
        });
}



function getTransform(translation, ratio) {
    const result = [];
    if (translation) {
        result.push(`translate(${translation.x}px,${translation.y}px)`);
    }
    if (ratio) {
        result.push(`scale(${ratio})`);
    }
    return result.join(' ');
}
