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
        draggedMeat.style.height = '33고기를 접시에 올릴 때 크기를 줄임
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

// 시간과 날짜를 업데이트하는 함수
function updateTime() {
    let timeElement = document.querySelector('.date-time');
    let currentTime = new Date(timeElement.textContent.replace(/월|일|:/g, '').split(' '));

    // 게임 시간: 1시간 = 현실 시간 10분
    currentTime.setMinutes(currentTime.getMinutes() + 1);

    // 시간 업데이트
    timeElement.textContent = formatTime(currentTime);
}

// 시간을 포맷하는 함수
function formatTime(date) {
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');

    return `${month}월 ${day}일 ${hours}:${minutes}`;
}

// 시간 업데이트를 일정 간격마다 호출 (게임 시간 1시간 = 현실 시간 10분)
setInterval(updateTime, 10000); // 10초마다 1분 증가 (현실 시간 10분 = 게임 시간 1시간)
