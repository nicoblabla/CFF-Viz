new fullpage('#fullpage', {
    //options here
    autoScrolling: true,
    scrollHorizontally: true,
    anchors: ['home', 'delays', 'trains'],
    scrollOverflow: true,
    normalScrollElements: '.scrollable-content',
    afterLoad: (origin, destination) => {
        if (destination.anchor == 'trains') {
            trains.start();
        }
    },
    onLeave: (origin, destination) => {
        if (origin.anchor == 'trains') {
            trains.stop();
        }
    }
});


function incNumberAnimation(i, end, element) {
    if (i <= end) {
        element.innerHTML = i;
        setTimeout(function () {
            incNumberAnimation(i + 1, end, element);
        }, speed);
    }
}

function startNumberAnimation() {
    let elements = document.querySelectorAll('[data-number-animation="true"]');
    for (let element of elements) {
        let speed = parseInt(element.getAttribute("data-number-animation-speed"));
        let end = parseInt(element.innerHTML);
        element.innerHTML = '0';
        animation(element, end, speed);
    }

    async function animation(element, end, speed) {
        for (let i = 0; i <= end; i += speed) {
            element.innerHTML = Math.round(easeInOutCubic(i / end) * end);
            await sleep(1);
        }
        element.innerHTML = end;
    }
}
startNumberAnimation();

async function sleep(delay) {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
}

//https://easings.net/#easeInOutCubic
function easeInOutCubic(x) {
    //return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    //return x < 0.5 ? 16 * x * x * x * x * x : 1 - Math.pow(-2 * x + 2, 5) / 2;
    return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}