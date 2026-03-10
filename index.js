function animaster() {
    function resetFadeIn(element) {
        element.classList.remove('show');
        element.classList.add('hide');
        element.style.transitionDuration = null;
    }

    function resetFadeOut(element) {
        element.classList.remove('hide');
        element.classList.add('show');
        element.style.transitionDuration = null;
    }

    function resetMoveAndScale(element) {
        element.style.transitionDuration = null;
        element.style.transform = null;
    }

    const animaster = {
        _steps: [],

        fadeIn(element, duration) {
            element.style.transitionDuration = `${duration}ms`;
            element.classList.remove('hide');
            element.classList.add('show');
            return () => resetFadeIn(element);
        },

        fadeOut(element, duration) {
            element.style.transitionDuration = `${duration}ms`;
            element.classList.remove('show');
            element.classList.add('hide');
            return () => resetFadeOut(element);
        },

        move(element, duration, translation) {
            return this
                .addMove(duration, translation)
                .play(element);
            element.style.transitionDuration = `${duration}ms`;
            element.style.transform = getTransform(translation, null);
            return () => resetMoveAndScale(element);
        },

        scale(element, duration, ratio) {
            element.style.transitionDuration = `${duration}ms`;
            element.style.transform = getTransform(null, ratio);
            return () => resetMoveAndScale(element);
        },

        moveAndHide(element, duration) {
            const moveTime = duration * 2 / 5;
            const fadeTime = duration * 3 / 5;

            this.move(element, moveTime, { x: 100, y: 20 });

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
        },

        addMove(duration, translation) {
            this._steps.push({
                type: 'move',
                duration: duration,
                params: translation
            });

            return this;
        },

        play(element) {
            let totalTime = 0;

            this._steps.forEach(step => {
                setTimeout(() => {
                    if (step.type === 'move') {
                        element.style.transitionDuration = `${step.duration}ms`;
                        element.style.transform = getTransform(step.params, null);
                    }
                }, totalTime);

                totalTime += step.duration;
            });

            this._steps = [];
        }
    };

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
    document.getElementById('moveAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            animasterInstance.moveAndHide(block, 5000);
        });
    document.getElementById('showAndHidePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock') || document.getElementById('showAndHide');
            animasterInstance.showAndHide(block, 5000);
        });
    document.getElementById('heartBeatingPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock') || document.getElementById('heartBeating');
            if (typeof animasterInstance.heartBeating === 'function') {
                animasterInstance.heartBeating(block);
            }
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