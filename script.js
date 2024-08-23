const grillSpaces = document.querySelectorAll('.grill-space');
const meats = document.querySelectorAll('.meat');
const trash = document.getElementById('trash');
const plates = document.querySelectorAll('.plate');
let heatLevel = 1.0; // 초기 불세기: 강불

meats.forEach(meat => {
    meat.addEventListener('dragstart', dragStart);
    meat.addEventListener('dragend', dragEnd);
});

grillSpaces.forEach(space => {
    space.addEventListener('dragover', dragOver);
    space.addEventListener('drop', dropMeat);
    space.addEventListener('click', flipMeat);
});

trash.addEventListener('dragover', dragOver);
trash.addEventListener('drop', trashMeat);

plates.forEach(plate => {
    plate.addEventListener('dragover', dragOver);
    plate.addEventListener('drop', serveMeat);
});

function toggleHeat() {
    const button = document.querySelector("button");
    if (heatLevel === 1.0) {
        heatLevel = 1.5; // 중불
        button.innerText = "불세기: 중불";
    } else if (heatLevel === 1.5) {
        heatLevel = 2.0; // 약불
        button.innerText = "불세기: 약불";
    } else {
        heatLevel = 1.0; // 다시 강불
        button.innerText = "불세기: 강불";
    }
}

function dragStart(e) {
    e.target.classList.add('dragging');
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

function dropMeat(e) {
    const draggedMeat = document.querySelector('.dragging');
    if (e.target.classList.contains('grill-space') && e.target.childElementCount === 0) {
        e.target.appendChild(draggedMeat);
        startTimer(draggedMeat, "bottomTimer");
    }
}

function flipMeat(e) {
    if (e.target.classList.contains('meat')) {
        const meat = e.target;
        meat.classList.toggle('flipped');

        if (meat.classList.contains('flipped')) {
            switchTimer(meat, "bottomTimer", "topTimer");
        } else {
            switchTimer(meat, "topTimer", "bottomTimer");
        }
    }
}

function trashMeat(e) {
    const draggedMeat = document.querySelector('.dragging');
    if (draggedMeat) {
        clearInterval(draggedMeat.dataset.intervalId);
        draggedMeat.remove(); // 고기 삭제
    }
}

function serveMeat(e) {
    const draggedMeat = document.querySelector('.dragging');
    if (draggedMeat && draggedMeat.classList.contains('meat')) {
        clearInterval(draggedMeat.dataset.intervalId);
        draggedMeat.style.width = '33px'; // 고기를 접시에 올릴 때 크기를 줄임
        draggedMeat.style.height = '33px';
        e.target.appendChild(draggedMeat);
    }
}

function startTimer(meat, timerType) {
    let cookingData = JSON.parse(meat.dataset.cookingData || '{"bottomTimer": 0, "topTimer": 0}');
    let startTime = new Date().getTime();

    const cookingInterval = setInterval(() => {
        const currentTime = new Date().getTime();
        const elapsedTime = (currentTime - startTime) / 1000 * heatLevel;

        cookingData[timerType] += elapsedTime;
        updateMeatImage(meat, cookingData);
        meat.dataset.cookingData = JSON.stringify(cookingData);
        startTime = currentTime;

        if (meat.parentElement.classList.contains('plate')) {
            clearInterval(cookingInterval);
        }
    }, 50);

    meat.dataset.intervalId = cookingInterval;
}

function switchTimer(meat, fromTimer, toTimer) {
    clearInterval(meat.dataset.intervalId);
    startTimer(meat, toTimer);
}

function updateMeatImage(meat, cookingData) {
    const bottomTimer = cookingData.bottomTimer;
    const topTimer = cookingData.topTimer;

    let imageUrl = '';

    if (topTimer >= 25 || bottomTimer >= 25) {
        imageUrl = "images/5.ash_meet.png";
    } else if (meat.classList.contains('flipped')) {
        if (bottomTimer < 5) imageUrl = "images/0.raw_meet_flipped.png";
        else if (bottomTimer < 10) imageUrl = "images/1.medrare_meet_flipped.png";
        else if (bottomTimer < 15) imageUrl = "images/2.medium_meet_flipped.png";
        else if (bottomTimer < 20) imageUrl = "images/3.welldone_meet_flipped.png";
        else imageUrl = "images/4.burning_meet_flipped.png";
    } else {
        if (topTimer < 5) imageUrl = "images/0.raw_meet.png";
        else if (topTimer < 10) imageUrl = "images/1.medrare_meet.png";
        else if (topTimer < 15) imageUrl = "images/2.medium_meet.png";
        else if (topTimer < 20) imageUrl = "images/3.welldone_meet.png";
        else imageUrl = "images/4.burning_meet.png";
    }

    meat.style.backgroundImage = `url(${imageUrl})`;
}
