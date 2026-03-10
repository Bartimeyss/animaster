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

    function resetFadeIn(element) {
        element.classList.remove('show');
        element.classList.add('hide');
        element.style.transitionDuration = null;
    }

    function resetMoveAndScale(element) {
        element.style.transitionDuration = null;
        element.style.transform = null;
    }

    return {
        _steps: [],

        fadeIn(element, duration) {
            return this
                .addFadeIn(duration)
                .play(element).resetFadeIn(element);
        },

        fadeOut(element, duration) {
            return this
                .addFadeOut(duration)
                .play(element).resetFadeOut(element);
        },

        move(element, duration, translation) {
            return this
                .addMove(duration, translation)
                .play(element).resetMoveAndScale(element);
        },

        scale(element, duration, ratio) {
            return this
                .addScale(duration, ratio)
                .play(element).resetMoveAndScale(element);
        },

        moveAndHide(element, duration) {
            const moveTime = duration * 2 / 5;
            const fadeTime = duration * 3 / 5;

            this.move(element, moveTime, { x: 100, y: 20 });

            const fadeTimeoutId = setTimeout(() => {
                this.fadeOut(element, fadeTime);
            }, moveTime);

            return {
                reset() {
                    clearTimeout(fadeTimeoutId);
                    resetFadeOut(element);
                    resetMoveAndScale(element);
                }
            };
        },

        showAndHide(element, duration) {
            const part = duration / 3;

            this.fadeIn(element, part);


            setTimeout(() => {
                this.fadeOut(element, part);
            }, part * 2);
            
        },

        heartBeating(element) {
            let stopped = false;
            let timeoutId = null;
            let enlarged = false;

            const beat = () => {
                if (stopped) {
                    return;
                }

                if (!enlarged) {
                    this.scale(element, 500, 1.4);
                    enlarged = true;
                } else {
                    this.scale(element, 500, 1);
                    enlarged = false;
                }

                timeoutId = setTimeout(beat, 500);
            };

            beat();

            return {
                stop() {
                    stopped = true;
                    clearTimeout(timeoutId);
                    resetMoveAndScale(element)
                }
            };
        },

        addMove(duration, translation) {
            this._steps.push({
                type: 'move',
                duration: duration,
                params: translation
            });

            return this;
        },

        addScale(duration, ratio) {
            this._steps.push({
                type: 'scale',
                duration: duration,
                params: ratio
            });

            return this;
        },

        addFadeIn(duration) {
            this._steps.push({
                type: 'fadeIn',
                duration: duration
            });

            return this;
        },

        addFadeOut(duration) {
            this._steps.push({
                type: 'fadeOut',
                duration: duration
            });

            return this;
        },

        play(element) {
            let totalTime = 0;

            this._steps.forEach(step => {
                setTimeout(() => {
                    switch (step.type) {
                        case 'move':
                            element.style.transitionDuration = `${step.duration}ms`;
                            element.style.transform = getTransform(step.params, null);
                            break;
                        case 'scale':
                            element.style.transitionDuration = `${step.duration}ms`;
                            element.style.transform = getTransform(null, step.params);
                            break;
                        case 'fadeIn':
                            element.style.transitionDuration = `${step.duration}ms`;
                            element.classList.remove('hide');
                            element.classList.add('show');
                            break;
                        case 'fadeOut':
                            element.style.transitionDuration = `${step.duration}ms`;
                            element.classList.remove('show');
                            element.classList.add('hide');
                            break;
                    }
                }, totalTime);

                totalTime += step.duration;
            });

            this._steps = [];

            return {
                reset() {
                    resetFadeIn(element);
                    resetFadeOut(element);
                    resetMoveAndScale(element);
                }
            };
        }
    };
}

function buildCustomAnimation() {
    return animaster()
        .addMove(200, { x: 40, y: 40 })
        .addScale(800, 1.3)
        .addMove(200, { x: 80, y: 0 })
        .addScale(800, 1)
        .addMove(200, { x: 40, y: -40 })
        .addScale(800, 0.7)
        .addMove(200, { x: 0, y: 0 })
        .addScale(800, 1);
}


addListeners();

function addListeners() {
    const animasterInstance = animaster();
    let heartBeatingAnimation = null;
    let moveAndHideAnimation = null;

    const fadeInPlay = document.getElementById('fadeInPlay');
    if (fadeInPlay) {
        fadeInPlay.addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animasterInstance.fadeIn(block, 5000);
        });
    }

    const movePlay = document.getElementById('movePlay');
    if (movePlay) {
        movePlay.addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animasterInstance.move(block, 1000, { x: 100, y: 10 });
        });
    }

    const scalePlay = document.getElementById('scalePlay');
    if (scalePlay) {
        scalePlay.addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animasterInstance.scale(block, 1000, 1.25);
        });
        document.getElementById('moveAndHidePlay')
            .addEventListener('click', function () {
                const block = document.getElementById('moveAndHideBlock');

                if (moveAndHideAnimation && typeof moveAndHideAnimation.reset === 'function') {
                    moveAndHideAnimation.reset();
                }

                moveAndHideAnimation = animasterInstance.moveAndHide(block, 5000);
            });
        document.getElementById('showAndHidePlay')
            .addEventListener('click', function () {
                const block = document.getElementById('showAndHideBlock') || document.getElementById('showAndHide');
                animasterInstance.showAndHide(block, 5000);
            });
        document.getElementById('heartBeatingPlay')
            .addEventListener('click', function () {
                const block = document.getElementById('heartBeatingBlock') || document.getElementById('heartBeating');

                if (heartBeatingAnimation) {
                    heartBeatingAnimation.stop();
                }

                heartBeatingAnimation = animasterInstance.heartBeating(block);
            });

        document.getElementById('heartBeatingStop')
            .addEventListener('click', function () {
                if (heartBeatingAnimation) {
                    heartBeatingAnimation.stop();
                    heartBeatingAnimation = null;
                }
            });
    }

    const customAnimationPlay = document.getElementById('customAnimationPlay');
    if (customAnimationPlay) {
        customAnimationPlay.addEventListener('click', function () {
            const block = document.getElementById('customAnimationBlock') || document.getElementById('customAnimation');
            buildCustomAnimation().play(block);
        });
    }
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
