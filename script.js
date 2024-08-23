document.addEventListener('DOMContentLoaded', () => {
    const meats = document.querySelectorAll('.meat-item');
    const grillSpaces = document.querySelectorAll('.grill-space');
    const trash = document.querySelector('.trashcan-1');
    const plates = document.querySelectorAll('.customer-plate-1, .customer-plate-2, .customer-plate-3, .customer-plate-4');

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

    function dragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        setTimeout(() => {
            e.target.style.visibility = 'hidden';
        }, 50);
    }

    function dragEnd(e) {
        e.target.style.visibility = 'visible';
    }

    function dragOver(e) {
        e.preventDefault();
    }

    function dropMeat(e) {
        e.preventDefault();
        const meatId = e.dataTransfer.getData('text/plain');
        const draggedMeat = document.getElementById(meatId);
        if (draggedMeat && e.target.classList.contains('grill-space') && !e.target.hasChildNodes()) {
            e.target.appendChild(draggedMeat);
            draggedMeat.style.position = 'absolute';
            draggedMeat.style.left = '0';
            draggedMeat.style.top = '0';

            // 고기 굽기 시작
            startBottomTimer(draggedMeat);
        }
    }

    function flipMeat(e) {
        const meat = e.target.querySelector('.meat-item');
        if (meat) {
            if (meat.classList.contains('flipped')) {
                meat.classList.remove('flipped');
                stopTopTimer(meat);
                startBottomTimer(meat);
            } else {
                meat.classList.add('flipped');
                stopBottomTimer(meat);
                startTopTimer(meat);
            }
        }
    }

    function trashMeat(e) {
        e.preventDefault();
        const meatId = e.dataTransfer.getData('text/plain');
        const draggedMeat = document.getElementById(meatId);
        if (draggedMeat) {
            stopTimers(draggedMeat);
            draggedMeat.remove();
        }
    }

    function serveMeat(e) {
        e.preventDefault();
        const meatId = e.dataTransfer.getData('text/plain');
        const draggedMeat = document.getElementById(meatId);
        if (draggedMeat) {
            stopTimers(draggedMeat);
            draggedMeat.style.position = 'absolute';
            draggedMeat.style.left = '0';
            draggedMeat.style.top = '0';
            draggedMeat.style.width = '33px'; // 고기를 접시에 올릴 때 크기를 줄임
            draggedMeat.style.height = '33px';
            e.target.appendChild(draggedMeat);
        }
    }

    function startBottomTimer(meat) {
        let cookingData = JSON.parse(meat.dataset.cookingData || '{"bottomTimer": 0, "topTimer": 0}');
        let startTime = new Date().getTime();

        const cookingInterval = setInterval(() => {
            const currentTime = new Date().getTime();
            const elapsedTime = (currentTime - startTime) / 1000; // 초 단위로 시간 측정
            cookingData.bottomTimer += elapsedTime;

            updateMeatImage(meat, cookingData);

            meat.dataset.cookingData = JSON.stringify(cookingData);
            startTime = currentTime;

            if (meat.parentElement.classList.contains('plate')) {
                clearInterval(cookingInterval);
            }
        }, 50);

        meat.dataset.intervalId = cookingInterval;
    }

    function startTopTimer(meat) {
        let cookingData = JSON.parse(meat.dataset.cookingData || '{"bottomTimer": 0, "topTimer": 0}');
        let startTime = new Date().getTime();

        const cookingInterval = setInterval(() => {
            const currentTime = new Date().getTime();
            const elapsedTime = (currentTime - startTime) / 1000; // 초 단위로 시간 측정
            cookingData.topTimer += elapsedTime;

            updateMeatImage(meat, cookingData);

            meat.dataset.cookingData = JSON.stringify(cookingData);
            startTime = currentTime;

            if (meat.parentElement.classList.contains('plate')) {
                clearInterval(cookingInterval);
            }
        }, 50);

        meat.dataset.intervalId = cookingInterval;
    }

    function stopTimers(meat) {
        clearInterval(meat.dataset.intervalId);
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
        const timeElement = document.querySelector('.date-time');
        const currentTimeText = timeElement.textContent;
        const [monthText, dayText, timeText] = currentTimeText.split(' ');
        const month = parseInt(monthText.replace('월', ''));
        const day = parseInt(dayText.replace('일', ''));
        const [hours, minutes] = timeText.split(':').map(Number);

        let date = new Date(2023, month - 1, day, hours, minutes);
        date.setMinutes(date.getMinutes() + 1); // 1분 증가

        const newMonth = String(date.getMonth() + 1).padStart(2, '0');
        const newDay = String(date.getDate()).padStart(2, '0');
        const newHours = String(date.getHours()).padStart(2, '0');
        const newMinutes = String(date.getMinutes()).padStart(2, '0');

        timeElement.textContent = `${newMonth}월 ${newDay}일 ${newHours}:${newMinutes}`;
    }

    // 10초마다 시간 업데이트
    setInterval(updateTime, 10000);
});
