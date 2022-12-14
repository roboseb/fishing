const fishList = {
    common: {
        color: 'red',
        height: '4rem',
        width: '5rem',
        value: 2,
    },

    uncommon: {
        color: 'blue',
        height: '6rem',
        width: '7rem',
        value: 3,
    },

    rare: {
        color: 'green',
        height: '8rem',
        width: '8rem',
        value: 10,
    }
}

// Track pointer to mouse position on mouse enter.
const water = document.getElementById('water');
water.addEventListener('mousemove', (e) => {
    alignPointer(e);
});

let thrown = false;
let money = 20;

// Fire a javelin on click.
water.addEventListener('click', () => {
    const spear = document.querySelector('#spear');

    if (!thrown && money >= 5) {
        throwSpear(spear);
        thrown = true;
    } else {
        retrieveSpear(spear);
        thrown = false;
    }
});

// Sell currently speared fish on right mouse button.
water.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    // Exit function unless spear is not currently thrown.
    if (thrown) return;

    const spear = document.getElementById('spear');
    const fish = Array.from(spear.querySelectorAll('.fish'));

    sellFish(fish);
});

// Sell all fish currently on spear.
const sellFish = (fishes) => {

    fishes.forEach(fish => {
        updateMoney(fish.dataset.value);
    });

    animateLostFish();
}

// Update money and displayed money amount.
const updateMoney = (amount) => {
    const moneyDisplay = document.getElementById('money');
    money += parseInt(amount);
    moneyDisplay.innerText = `Money: ${money}`;
}

// Throw the spear.
const throwSpear = (spear) => {
    if (money < 5) return;
    updateMoney(-5);
    spear.style.top = '80%';
    spear.classList.add('thrown');
}

// Cap for the amount of pixels worth of fish that'll fit on the spear.
const spearLimit = 100;

// Retrieve the spear.
const retrieveSpear = (spear) => {
    spear.style.top = '0';

    const player = document.getElementById('player');
    const playerRect = player.getBoundingClientRect();
    const lineBox = document.getElementById('line-box');
    var rect = lineBox.getBoundingClientRect();
    spear.style.left = `${playerRect.x - rect.x}px`;


    spear.classList.remove('thrown');

    let fishSize = 0;

    const spearFish = Array.from(spear.querySelectorAll('.fish'));
    spearFish.forEach(fish => {
        const fishRect  = fish.getBoundingClientRect();
        fishSize += fishRect.height;
    });

    // If spear has too many fish, remove them all.
    if (fishSize >= spearLimit) {
        console.log('damn! you lost em!');
        animateLostFish();
    }
}

// Animate all current fish on spear, removing them from the spear and the water.
const animateLostFish = () => {
    const spear = document.getElementById('spear');
    const caughtFish = Array.from(spear.querySelectorAll('.fish'));
    const water = document.getElementById('water');

    caughtFish.forEach((fish, index) => {
        const fishRect = fish.getBoundingClientRect();
        const waterRect = water.getBoundingClientRect();
        const newFish = fish.cloneNode(true);

        // Redraw fish back into water.
        newFish.style.left = `${fishRect.x - waterRect.x}px`;
        newFish.style.top = `${fishRect.y - waterRect.y}px`;
        newFish.style.transform = 'initial';

        water.appendChild(newFish);

        // Animate fish swimming away.
        newFish.style.transition = 'all 500ms';
        newFish.style.transitionDelay = `${(caughtFish.length - index) * 10}ms`

        setTimeout(() => {
            const randAngle = Math.floor(Math.random() * 45);
            const mod = index % 2 ? '-' : '';
            newFish.style.transform = `rotate(${mod}${randAngle}deg) translate(${mod}100%)`;
            newFish.style.filter = 'opacity(0)';
        }, 0);
    });

    // Remove all fish from spear.
    caughtFish.forEach(fish => {
        fish.remove();
    });
    spearedFish = [];
}

let spearDirection = 'right';
oldX = 0;

// Adjust aiming line pointer when hovering over water.
const alignPointer = (e) => {
    const lineBox = document.getElementById('line-box');
    const line = lineBox.querySelector('line');
    const spear = document.querySelector('#spear');
    const player = document.getElementById('player');

    // e = Mouse click event.
    var rect = lineBox.getBoundingClientRect();
    var x = e.clientX - rect.x;
    var y = e.clientY - rect.y;

    if (oldX > e.clientX) {
        spearDirection = 'left';
    } else {
        spearDirection = 'right';
    }

    oldX = e.clientX;

    // Update line position.
    line.setAttribute('x1', `${x}px`);
    line.setAttribute('x2', `${x}px`);
    line.setAttribute('y2', `${y}px`);

    // Update player position.
    player.style.left = `${x}px`;

    // Update spear position unless already thrown.
    if (thrown) return;
    animateSpear();
    spear.style.left = `${x}px`;
}

let spearAniTimer;

// Animate spear moving left or right.
const animateSpear = () => {
    if (spearDirection === 'right') {
        spear.classList.remove('going-left');
        spear.classList.add('going-right');
    } else {
        spear.classList.remove('going-right');
        spear.classList.add('going-left');
    }

    clearTimeout(spearAniTimer);
    spearAniTimer = setTimeout(() => {
        spear.classList.remove('going-left', 'going-right');
    }, 100);
}

let frameCounter = 0;

// Function for containing functions to be called on every frame (60 times per second).
const frameEffect = setInterval(() => {
    checkCollision();
    generateFish(120);
    frameCounter++;
}, 17);

// Check for spear colliding with fish.
const checkCollision = () => {
    const spearHitbox = document.getElementById('spear-hitbox');
    const fishHitboxes = Array.from(document.querySelectorAll('.fish'));
    const spearRect = spearHitbox.getBoundingClientRect();

    fishHitboxes.forEach(fish => {
        const fishRect = fish.getBoundingClientRect();

        // Spear has connected with a fish.
        if (spearRect.x < fishRect.x + fishRect.width &&
            spearRect.x + spearRect.width > fishRect.x &&
            spearRect.y < fishRect.y + fishRect.height &&
            spearRect.height + spearRect.y > fishRect.y) {

            spearFish(fish);
        }
    });
}

let fishCounter = 1;

const generateFish = (interval) => {
    if (frameCounter % interval === 0 && frameCounter !== 0) {

        // Choose a random fish to generate.
        const roll = Math.floor(Math.random() * 100);
        let chosenFish;

        if (roll > 50) {
            chosenFish = 'common';
        } else if (roll > 25) {
            chosenFish = 'uncommon';
        } else {
            chosenFish = 'rare';
        }   

        const fishDetails = fishList[chosenFish];

        // Customize fish and add it to the water.
        const water = document.getElementById('fish-box');
        const fish = document.createElement('img');

        fish.src = `./images/fish-${fishDetails.color}.png`;
        fish.draggable = 'false';
        fish.classList.add('fish', `fish-${fishCounter}`);
        fish.dataset.caught = 'false';
        fish.dataset.value = fishDetails.value;

        fish.style.left = '100%';
        fish.style.bottom = `${roll}%`;
        fish.style.backgroundColor = 'initial';
        fish.style.height = fishDetails.height;
        fish.style.width = 'auto';

        water.appendChild(fish);

        // Delete fish after animation is done.
        setTimeout(() => {
            if (fish) fish.remove();
        }, 5000);

        fishCounter++;
    }
}

let spearedFish = [];

// Process connecting a spear throw with a fish.
const spearFish = (fish) => {

    // Escape function if fish has already been caught.
    if (fish.dataset.caught === 'true') return;

    spearedFish.push(fish);
    fish.dataset.caught = true;

    const spear = document.getElementById('spear');
    const newFish = fish.cloneNode(true);

    spear.appendChild(newFish);


    // Offset fish on spear.
    const spearRect = document.getElementById('spear').getBoundingClientRect();
    const fishRect = fish.getBoundingClientRect();

    const fishCenter = fishRect.x + fishRect.width / 2;
    const offset = (spearRect.x - fishCenter) * -1;

    newFish.style.left = `${offset}px`;
    newFish.style.top = `${100 / (spearedFish.length + 1)}%`;

    const caughtFish = Array.from(document.getElementById('spear').querySelectorAll('.fish'));
    caughtFish.forEach((fish, index) => {
        fish.style.top = `${100 / (spearedFish.length + 1) * (index + 1)}%`;
    });

    // Delete fish displayed in water.
    fish.remove();
}