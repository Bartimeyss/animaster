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
            return this
                .addFadeIn(duration)
                .play(element);
        },

        fadeOut(element, duration) {
            return this
                .addFadeOut(duration)
                .play(element);
        },

        move(element, duration, translation) {
            return this
                .addMove(duration, translation)
                .play(element);
        },

        scale(element, duration, ratio) {
            return this
                .addScale(duration, ratio)
                .play(element);
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

        addDelay(duration) {
            this._steps.push({
                type: 'delay',
                duration: duration
            });

            return this;
        },

        play(element, cycled = false) {
            const steps = [...this._steps];
            this._steps = [];

            let stopped = false;
            const timeoutIds = [];

            const runSteps = () => {
                let totalTime = 0;

                steps.forEach(step => {
                    const timeoutId = setTimeout(() => {
                        if (stopped) {
                            return;
                        }

                        if (step.type === 'move') {
                            element.style.transitionDuration = `${step.duration}ms`;
                            element.style.transform = getTransform(step.params, null);
                        }

                        if (step.type === 'scale') {
                            element.style.transitionDuration = `${step.duration}ms`;
                            element.style.transform = getTransform(null, step.params);
                        }

                        if (step.type === 'fadeIn') {
                            element.style.transitionDuration = `${step.duration}ms`;
                            element.classList.remove('hide');
                            element.classList.add('show');
                        }

                        if (step.type === 'fadeOut') {
                            element.style.transitionDuration = `${step.duration}ms`;
                            element.classList.remove('show');
                            element.classList.add('hide');
                        }

                        if (step.type === 'delay') {
                        }
                    }, totalTime);

                    timeoutIds.push(timeoutId);
                    totalTime += step.duration;
                });

                if (cycled) {
                    const cycleTimeoutId = setTimeout(() => {
                        if (!stopped) {
                            runSteps();
                        }
                    }, totalTime);

                    timeoutIds.push(cycleTimeoutId);
                }
            };

            runSteps();

            return {
                stop() {
                    stopped = true;
                    timeoutIds.forEach(id => clearTimeout(id));
                    resetMoveAndScale(element);
                }
            };
        },

        moveAndHide(element, duration) {
            const moveTime = duration * 2 / 5;
            const fadeTime = duration * 3 / 5;

            return this
                .addMove(moveTime, { x: 100, y: 20 })
                .addFadeOut(fadeTime)
                .play(element);
        },

        showAndHide(element, duration) {
            const part = duration / 3;

            return this
                .addFadeIn(part)
                .addDelay(part)
                .addFadeOut(part)
                .play(element);
        },

        heartBeating(element) {
            return this
                .addScale(500, 1.4)
                .addScale(500, 1)
                .play(element, true);
        }
    };

    return animaster;
}

addListeners();

function addListeners() {
    const animasterInstance = animaster();
    let heartBeatingAnimation = null;

    document.getElementById('fadeInPlay')
        .addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            animasterInstance.fadeIn(block, 5000);
        });

    document.getElementById('movePlay')
        .addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            animasterInstance.move(block, 1000, { x: 100, y: 10 });
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

            if (heartBeatingAnimation) {
                heartBeatingAnimation.stop();
            }

            heartBeatingAnimation = animasterInstance.heartBeating(block);
        });

    const heartStopButton = document.getElementById('heartBeatingStop');
    if (heartStopButton) {
        heartStopButton.addEventListener('click', function () {
            if (heartBeatingAnimation) {
                heartBeatingAnimation.stop();
                heartBeatingAnimation = null;
            }
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