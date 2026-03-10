function animaster(steps = []) {
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

    return {
        _steps: steps,

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

        moveAndHide(element, duration) {
            const moveTime = duration * 2 / 5;
            const fadeTime = duration * 3 / 5;

            return this
                .addMove(moveTime, {x: 100, y: 20})
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
        },

        addMove(duration, translation) {
            return animaster([
                ...this._steps,
                {
                    type: 'move',
                    duration: duration,
                    params: translation
                }
            ]);
        },

        addScale(duration, ratio) {
            return animaster([
                ...this._steps,
                {
                    type: 'scale',
                    duration: duration,
                    params: ratio
                }
            ]);
        },

        addFadeIn(duration) {
            return animaster([
                ...this._steps,
                {
                    type: 'fadeIn',
                    duration: duration
                }
            ]);
        },

        addFadeOut(duration) {
            return animaster([
                ...this._steps,
                {
                    type: 'fadeOut',
                    duration: duration
                }
            ]);
        },

        addDelay(duration) {
            return animaster([
                ...this._steps,
                {
                    type: 'delay',
                    duration: duration
                }
            ]);
        },

        play(element, cycled = false) {
            const plannedSteps = [...this._steps];
            const timeoutIds = [];
            let isStopped = false;

            const initialState = {
                hadHideClass: element.classList.contains('hide'),
                hadShowClass: element.classList.contains('show'),
                transitionDuration: element.style.transitionDuration,
                transform: element.style.transform
            };

            const scheduleOneCycle = (offset) => {
                let totalTime = 0;

                plannedSteps.forEach(step => {
                    const timeoutId = setTimeout(() => {
                        if (isStopped) {
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
                    }, offset + totalTime);

                    timeoutIds.push(timeoutId);
                    totalTime += step.duration;
                });

                return totalTime;
            };

            const cycleDuration = scheduleOneCycle(0);

            if (cycled && cycleDuration > 0) {
                const loop = () => {
                    if (isStopped) {
                        return;
                    }

                    scheduleOneCycle(0);
                    const loopTimeoutId = setTimeout(loop, cycleDuration);
                    timeoutIds.push(loopTimeoutId);
                };

                const firstLoopTimeoutId = setTimeout(loop, cycleDuration);
                timeoutIds.push(firstLoopTimeoutId);
            }

            return {
                stop() {
                    isStopped = true;
                    timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
                },

                reset() {
                    this.stop();

                    resetMoveAndScale(element);

                    if (initialState.hadHideClass && !initialState.hadShowClass) {
                        resetFadeIn(element);
                    } else if (initialState.hadShowClass && !initialState.hadHideClass) {
                        resetFadeOut(element);
                    } else {
                        element.classList.remove('show');
                        element.classList.remove('hide');
                        if (initialState.hadShowClass) {
                            element.classList.add('show');
                        }
                        if (initialState.hadHideClass) {
                            element.classList.add('hide');
                        }
                        element.style.transitionDuration = null;
                    }

                    element.style.transitionDuration = initialState.transitionDuration;
                    element.style.transform = initialState.transform;
                }
            };
        }
    };
}

const customAnimation = animaster()
    .addMove(200, {x: 40, y: 40})
    .addScale(800, 1.3)
    .addMove(200, {x: 80, y: 0})
    .addScale(800, 1)
    .addMove(200, {x: 40, y: -40})
    .addScale(800, 0.7)
    .addMove(200, {x: 0, y: 0})
    .addScale(800, 1);

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
            animasterInstance.move(block, 1000, {x: 100, y: 10});
        });
    }

    const scalePlay = document.getElementById('scalePlay');
    if (scalePlay) {
        scalePlay.addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            animasterInstance.scale(block, 1000, 1.25);
        });
    }

    const moveAndHidePlay = document.getElementById('moveAndHidePlay');
    if (moveAndHidePlay) {
        moveAndHidePlay.addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            if (moveAndHideAnimation) {
                moveAndHideAnimation.reset();
            }
            moveAndHideAnimation = animasterInstance.moveAndHide(block, 5000);
        });
    }

    const moveAndHideReset = document.getElementById('moveAndHideReset');
    if (moveAndHideReset) {
        moveAndHideReset.addEventListener('click', function () {
            if (moveAndHideAnimation) {
                moveAndHideAnimation.reset();
                moveAndHideAnimation = null;
            }
        });
    }

    const showAndHidePlay = document.getElementById('showAndHidePlay');
    if (showAndHidePlay) {
        showAndHidePlay.addEventListener('click', function () {
            const block = document.getElementById('showAndHideBlock') || document.getElementById('showAndHide');
            animasterInstance.showAndHide(block, 5000);
        });
    }

    const heartBeatingPlay = document.getElementById('heartBeatingPlay');
    if (heartBeatingPlay) {
        heartBeatingPlay.addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock') || document.getElementById('heartBeating');
            if (heartBeatingAnimation) {
                heartBeatingAnimation.stop();
            }
            heartBeatingAnimation = animasterInstance.heartBeating(block);
        });
    }

    const heartBeatingStop = document.getElementById('heartBeatingStop');
    if (heartBeatingStop) {
        heartBeatingStop.addEventListener('click', function () {
            if (heartBeatingAnimation) {
                heartBeatingAnimation.stop();
                heartBeatingAnimation = null;
            }
        });
    }

    const customAnimationPlay = document.getElementById('customAnimationPlay');
    if (customAnimationPlay) {
        customAnimationPlay.addEventListener('click', function () {
            const block = document.getElementById('customAnimation');
            customAnimation.play(block);
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
