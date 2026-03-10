addListeners();

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

    return {
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

        buildHandler() {
            const animation = this;

            return function () {
                return animation.play(this);
            };
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

            const stopAnimation = () => {
                isStopped = true;
                timeoutIds.forEach(timeoutId => clearTimeout(timeoutId));
            };

            const resetAnimation = () => {
                stopAnimation();

                resetMoveAndScale(element);

                element.classList.remove('show');
                element.classList.remove('hide');

                if (initialState.hadHideClass && !initialState.hadShowClass) {
                    resetFadeIn(element);
                } else if (initialState.hadShowClass && !initialState.hadHideClass) {
                    resetFadeOut(element);
                } else {
                    if (initialState.hadShowClass) {
                        element.classList.add('show');
                    }
                    if (initialState.hadHideClass) {
                        element.classList.add('hide');
                    }
                }

                element.style.transitionDuration = initialState.transitionDuration;
                element.style.transform = initialState.transform;
            };

            return {
                stop() {
                    stopAnimation();
                },

                reset() {
                    resetAnimation();
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

function addListeners() {
    let fadeInAnimation = null;
    let moveAnimation = null;
    let scaleAnimation = null;
    let heartBeatingAnimation = null;
    let moveAndHideAnimation = null;
    let showAndHideAnimation = null;
    let customAnimationController = null;

    const fadeInPlay = document.getElementById('fadeInPlay');
    if (fadeInPlay) {
        fadeInPlay.addEventListener('click', function () {
            const block = document.getElementById('fadeInBlock');
            if (fadeInAnimation) {
                fadeInAnimation.stop();
            }
            fadeInAnimation = animaster().fadeIn(block, 5000);
        });
    }

    const fadeInReset = document.getElementById('fadeInReset');
    if (fadeInReset) {
        fadeInReset.addEventListener('click', function () {
            if (fadeInAnimation) {
                fadeInAnimation.reset();
                fadeInAnimation = null;
            }
        });
    }

    const movePlay = document.getElementById('movePlay');
    if (movePlay) {
        movePlay.addEventListener('click', function () {
            const block = document.getElementById('moveBlock');
            if (moveAnimation) {
                moveAnimation.stop();
            }
            moveAnimation = animaster().move(block, 1000, {x: 100, y: 10});
        });
    }

    const moveReset = document.getElementById('moveReset');
    if (moveReset) {
        moveReset.addEventListener('click', function () {
            if (moveAnimation) {
                moveAnimation.reset();
                moveAnimation = null;
            }
        });
    }

    const scalePlay = document.getElementById('scalePlay');
    if (scalePlay) {
        scalePlay.addEventListener('click', function () {
            const block = document.getElementById('scaleBlock');
            if (scaleAnimation) {
                scaleAnimation.stop();
            }
            scaleAnimation = animaster().scale(block, 1000, 1.25);
        });
    }

    const scaleReset = document.getElementById('scaleReset');
    if (scaleReset) {
        scaleReset.addEventListener('click', function () {
            if (scaleAnimation) {
                scaleAnimation.reset();
                scaleAnimation = null;
            }
        });
    }

    const moveAndHidePlay = document.getElementById('moveAndHidePlay');
    if (moveAndHidePlay) {
        moveAndHidePlay.addEventListener('click', function () {
            const block = document.getElementById('moveAndHideBlock');
            if (moveAndHideAnimation) {
                moveAndHideAnimation.reset();
            }
            moveAndHideAnimation = animaster().moveAndHide(block, 5000);
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
            if (showAndHideAnimation) {
                showAndHideAnimation.stop();
            }
            showAndHideAnimation = animaster().showAndHide(block, 5000);
        });
    }

    const showAndHideReset = document.getElementById('showAndHideReset');
    if (showAndHideReset) {
        showAndHideReset.addEventListener('click', function () {
            if (showAndHideAnimation) {
                showAndHideAnimation.reset();
                showAndHideAnimation = null;
            }
        });
    }

    const heartBeatingPlay = document.getElementById('heartBeatingPlay');
    if (heartBeatingPlay) {
        heartBeatingPlay.addEventListener('click', function () {
            const block = document.getElementById('heartBeatingBlock') || document.getElementById('heartBeating');
            if (heartBeatingAnimation) {
                heartBeatingAnimation.stop();
            }
            heartBeatingAnimation = animaster().heartBeating(block);
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

    const heartBeatingReset = document.getElementById('heartBeatingReset');
    if (heartBeatingReset) {
        heartBeatingReset.addEventListener('click', function () {
            if (heartBeatingAnimation) {
                heartBeatingAnimation.reset();
                heartBeatingAnimation = null;
            }
        });
    }

    const customAnimationPlay = document.getElementById('customAnimationPlay');
    if (customAnimationPlay) {
        customAnimationPlay.addEventListener('click', function () {
            const block = document.getElementById('customAnimation');
            if (customAnimationController) {
                customAnimationController.stop();
            }
            customAnimationController = customAnimation.play(block);
        });
    }

    const customAnimationReset = document.getElementById('customAnimationReset');
    if (customAnimationReset) {
        customAnimationReset.addEventListener('click', function () {
            if (customAnimationController) {
                customAnimationController.reset();
                customAnimationController = null;
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