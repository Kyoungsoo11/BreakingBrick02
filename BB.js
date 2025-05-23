window.onload = pageLoad;

let colorPicker;

function pageLoad(){
	playBgm(0); // 브라우저에서 음악 자동실행 막아서 안됨.
	document.getElementById("volume-range").addEventListener("input", function (e) { //볼륨조절 이벤트
    	tempVolume = parseFloat(e.target.value);
		if (currentBgm) {
    		currentBgm.volume = tempVolume;
  }
  	});
  colorPicker = document.getElementById("ballColorPicker");
  colorPicker.addEventListener("input", (e) => { //공 색상 변경
    tempColor = e.target.value;
  }); 
	document.getElementById("play-btn").onclick=goStart;
	document.getElementById("back-btn").onclick=goMain;
	document.getElementById("setting-btn").onclick=goSetting;
	document.getElementById("quit-btn").onclick=goQuit;
	document.getElementById("lv1-btn").onclick=goLv1;
	document.getElementById("lv2-btn").onclick=goLv2;
	document.getElementById("lv3-btn").onclick=goLv3;
	document.getElementById("reset-btn").onclick=setReset;
	document.getElementById("apply-btn").onclick=setApply;
	document.getElementById("back-btn2").onclick=backSetting;
	document.getElementById("restart-btn").onclick=restart;
  document.getElementById("game-main-btn").onclick=gameToMain;
  document.getElementById("skip-btn").onclick=introToMain;

  const introParagraphs = document.querySelectorAll("#intro p");

  function typeText(element, text, speed = 50) {
    let idx = 0;
    element.textContent = "";
    element.style.display = "block";

    function typeChar() {
      if (idx < text.length) {
        element.textContent += text.charAt(idx);
        idx++;
        setTimeout(typeChar, speed);
      }
    }

    typeChar();
  }

  introParagraphs.forEach((p, i) => {
    const text = p.getAttribute("data-text");

    setTimeout(() => {
      typeText(p, text, 50);

      // 문단이 등장한 시점 기준 10초 후 사라짐
      setTimeout(() => {
        p.style.display = "none";
      }, 10000);
    }, i * 10000); // 10초 간격으로 등장
  });
}


var index = 5; //현재 페이지의 인덱스 저장
var page=["main-menu","select-level","game","setting","game-over", "intro", "epilogue"] // 페이지 추가는 맨뒤에 해주세요
var level= 0; //선택 난이도
let ballColor = "#FFFFFF"; //공 색상
let volume = 0; // 초기 볼륨. 편의성 위해 0으로 설정함 추후에 0.5로 수정 필요.
const initialTimes = {
  1: 300,
  2: 350,
  3: 400
};

document.addEventListener("click", function (e) { // 게임화면에서 메인메뉴버튼 여러개라서 이걸로 한꺼번에 처리함
if (e.target.classList.contains("game-main-btn")) {
    gameToMain();
    clearInterval(timerId);
}
});

let audioInitialized = false; //최초 음악 재생은 바디 클릭시 실행한다.
document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", function () {
    if (!audioInitialized) {
      playBgm(0);
      audioInitialized = true;
    }
  });
});

//메뉴 선택에 따른 페이지 변경
function changePage(i){
    if(index==2){
        document.getElementById("level"+level).style.display="none";
    }
	  document.getElementById(page[index]).style.display = "none";
	  index=i;
	  document.getElementById(page[index]).style.display = "block";
    if(i==2){ //난이도 선택 완료 후 게임 시작 시 아래 코드 실행, 노래재생 코드 포함
        document.getElementById("level"+level).style.display="block";
		    playBgm(level);
        gameStart(level);
    }
}
function goStart(){
	changePage(1);
}
function goMain(){
	changePage(0);
}
function goSetting(){
	changePage(3);
}
function goQuit() {
  const result = confirm("정말 게임을 종료하시겠습니까?");
  if (result) {
    window.close();
  } else return;
}
function goLv1() {
	level=1;
	changePage(2);
}
function goLv2() {
	level=2;
	changePage(2);
}
function goLv3() {
	level=3;
	changePage(2);
}
function gameToMain(){
  const result = confirm("메인 화면으로 돌아가시겠습니까?");
  if (result) {
    goMain();
    playBgm(0);
  } else return;
}
function introToMain(){
  const result = confirm("스토리를 건너뛰시겠습니까?");
  if (result) {
    goMain();
    playBgm(0);
  } else return;
}



// setting 관련
const mainBgm = new Audio("sound/main.mp3");
const lv1Bgm = new Audio("sound/lv1.mp3");
const lv2Bgm = new Audio("sound/lv2.mp3");
const lv3Bgm = new Audio("sound/lv3.mp3");
const bgmList = [mainBgm,lv1Bgm,lv2Bgm,lv3Bgm]; //난이도랑 인덱스랑 맞춰놓음.
let currentBgm = mainBgm; // 현재 재생 중인 음악 추적용
let tempVolume=0.5;
bgmList.forEach(bgm => {
  bgm.loop = true;
  bgm.volume = volume;
});
function playBgm(i) { //음악 재생 함수
  if (currentBgm) currentBgm.pause();
  currentBgm = bgmList[i];
  currentBgm.volume = volume;
  currentBgm.currentTime=0;
  currentBgm.play();
}
let tempColor="#FFFFFF";
function setReset(){
	tempVolume=0.5;
  tempColor= colorPicker.value ="#FFFFFF"
  currentBgm.volume = tempVolume;
	document.getElementById("volume-range").value = tempVolume;
}
function setApply(){
	volume=tempVolume;
  ballColor=tempColor;
  goMain();
}
function backSetting(){
  currentBgm.volume = volume;
  tempVolume = document.getElementById("volume-range").value = volume;
  tempColor = colorPicker.value = ballColor;
  goMain();
}

//게임 오버
function gameOver(){
    changePage(4);
}
function restart(){
    changePage(2);
}

// 게임 시작 (여기부터 게임 구현), 참고: level= 1,2,3 난이도 저장되어있음, 공 색상은 ballColor에 지정.
let timerId = null;

function gameStart(level) {
  if (timerId !== null) {
    clearInterval(timerId);
  }

  let lv = document.getElementById("level"+level);
  let timeLeftEl = lv.querySelector(".time-left");
  
  let left = initialTimes[level]; // 항상 초기값으로 시작
  timeLeftEl.innerHTML = left;

  console.log(`Level ${level} 시작: ${left}초`);

  timerId = setInterval(() => {
    left -= 1;
    timeLeftEl.innerHTML = left;

    if (left <= 0) {
      clearInterval(timerId);
      timerId = null;
      gameOver();
    }
  }, 1000);
}

function showParagraphs() {
  const paragraphs = document.querySelectorAll("#intro p");
  paragraphs.forEach((p, i) => {
    setTimeout(() => {
      p.style.display = "block";
    }, i * 10000); // 10초 간격 (10000ms)
  });
}

