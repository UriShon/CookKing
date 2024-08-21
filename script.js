// DOM 요소 선택
const meatContainer = document.getElementById('meatContainer');
const grillSpaces = document.querySelectorAll('.grill-space');
const trash = document.getElementById('trash');
const plates = document.querySelectorAll('.plate');
const servingSizeSelect = document.getElementById('servingSize');
const heatButton = document.getElementById('heatButton');
const resetButton = document.getElementById('resetButton');

let heatLevel = 1.0; // 초기 불세기: 강불
let meats = []; // 현재 화면에 표시된 고기들 배열

// 초기화 함수
function init() {
    generateMeats(parseInt(servingSizeSelect.value));
    attachEventListeners();
}

// 고기 생성 함수
function generateMeats(servingSize) {
    // 기존 고기 제거
    meatContainer.innerHTML = '';
    meats = [];

    // 인분당 고기 수 계산 (예: 1인분당 5개)
    const meatCount = servingSize * 5;

    for (let i = 0; i < meatCount; i++) {
        const meat = document.createElement('div');
        meat.classList.add('meat');
        meat.setAttribute('draggable', true);
        meat.dataset.index = i;
        meat.dataset.cookingData = JSON.stringify({ bottomTimer: 0, topTimer: 0 });
        meatContainer.appendChild(meat);
        meats.push(meat);
    }
}

// 이벤트 리스너 부착
function attachEventListeners() {
    meats.forEach(meat => {
        meat.addEventListener('dragstart', dragStart);
        meat.addEventListener('dragend', dragEnd);
    });

    grillSpaces.forEach(space => {
        space.addEventListener('dragover', dragOver);
        space.addEventListener('drop', dropMeatOnGrill);
        space.addEventListener('click', flipMeat);
    });

    plates.forEach(plate => {
        plate.addEventListener('dragover', dragOver);
        plate.addEventListener('drop', dropMeatOnPlate);
    });

    trash.addEventListener('dragover', dragOver);
    trash.addEventListener('drop', dropMeatInTrash);

    servingSizeSelect.addEventListener('change', () => {
        generateMeats(parseInt(servingSizeSelect.value));
        attachEventListeners();
    });

    heatButton.addEventListener('click', toggleHeat);
    resetButton.addEventListener('click', resetGame);
}

// 드래그 이벤트 핸들러
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
    e.target.classList.add('dragging');
}

function dragEnd(e) {
    e.target.classList.remove('dragging');
}

function dragOver(e) {
    e.preventDefault();
}

// 드롭 이벤트 핸들러 - 그릴
function dropMeatOnGrill(e) {
    e.preventDefault();
    const meatIndex = e.dataTransfer.getData('text/plain');
    const meat = meats[meatIndex];

    if (meat && e.target.classList.contains('grill-space') && !e.target.hasChildNodes()) {
        e.target.appendChild(meat);
        startCooking(meat);
    }
}

// 드롭 이벤트 핸들러 - 접시
function dropMeatOnPlate(e) {
    e.preventDefault();
    const meatIndex = e.dataTransfer.getData('text/plain');
    const meat = meats[meatIndex];

    if (meat && e.target.classList.contains('plate')) {
        stopCooking(meat);
        meat.style.width = '40px';
        meat.style.height = '40px';
        e.target.appendChild(meat);
    }
}

// 드롭 이벤트 핸들러 - 쓰레기통
function dropMeatInTrash(e) {
    e.preventDefault();
    const meatIndex = e.dataTransfer.getData('text/plain');
    const meat = meats[meatIndex];

    if (meat) {
        stopCooking(meat);
        meat.remove();
    }
}

// 고기 뒤집기
function flipMeat(e) {
    if (e.target.classList.contains('meat')) {
        const meat = e.target;
        meat.classList.toggle('flipped');

        if (meat.classList.contains('flipped')) {
            meat.dataset.side = 'top';
        } else {
            meat.dataset.side = 'bottom';
        }
    }
}

// 불세기 토글
function toggleHeat() {
    if (heatLevel === 1.0) {
        heatLevel = 1.5;
        heatButton.innerText = '불세기: 중불';
    } else if (heatLevel === 1.5) {
        heatLevel = 2.0;
        heatButton.innerText = '불세기: 약불';
    } else {
        heatLevel = 1.0;
        heatButton.innerText = '불세기: 강불';
    }
}

// 게임 리셋
function resetGame() {
    meats.forEach(meat => stopCooking(meat));
    generateMeats(parseInt(servingSizeSelect.value));
    attachEventListeners();
}

// 고기 굽기 시작
function startCooking(meat) {
    meat.cookingInterval = setInterval(() => {
        let cookingData = JSON.parse(meat.dataset.cookingData);
        const side = meat.dataset.side || 'bottom';

        cookingData[`${side}Timer`] += 0.1 * heatLevel;
        meat.dataset.cookingData = JSON.stringify(cookingData);

        updateMeatAppearance(meat, cookingData, side);
    }, 100);
}

// 고기 굽기 중지
function stopCooking(meat) {
    clearInterval(meat.cookingInterval);
}

// 고기 상태에 따른 이미지 업데이트
function updateMeatAppearance(meat, cookingData, side) {
    const time = cookingData[`${side}Timer`];
    let imageUrl = '';

    if (time < 5) {
        imageUrl = '0.raw_meat.png';
    } else if (time < 10) {
        imageUrl = '1.medrare_meat.png';
    } else if (time < 15) {
        imageUrl = '2.medium_meat.png';
    } else if (time < 20) {
        imageUrl = '3.welldone_meat.png';
    } else if (time < 25) {
        imageUrl = '4.burnt_meat.png';
    } else {
        imageUrl = '5.ash_meat.png';
    }

    // 뒤집힌 면 처리
    if (meat.classList.contains('flipped')) {
        const parts = imageUrl.split('.');
        imageUrl = `${parts[0]}_flipped.${parts[1]}`;
    }

    meat.style.backgroundImage = `url('${imageUrl}')`;
}

// 초기화 실행
window.onload = init;
