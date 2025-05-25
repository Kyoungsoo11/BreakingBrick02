window.onload = pageLoad;

let colorPicker;
let brickPicker;
const clickSfx = new Audio("sound/click.mp3");
clickSfx.volume = 0.5; // 클릭 효과음 초기값 설정
let clickGameToMain=false; // pause랑 main 안 겹치게 체크

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
  brickPicker = document.getElementById("brickColorPicker");
  brickPicker.addEventListener("input", (e) => { //공 색상 변경
    tempBrickColor = e.target.value;
  }); 
  document.getElementById("play-btn").onclick = () => { playClickSfx(); goStart(); };
  document.getElementById("back-btn").onclick = () => { playClickSfx(); goMain(); };
  document.getElementById("setting-btn").onclick = () => { playClickSfx(); goSetting(); };
  document.getElementById("quit-btn").onclick = () => { playClickSfx(); goQuit(); };
  document.getElementById("lv1-btn").onclick = () => { playClickSfx(); goLv1(); };
  document.getElementById("lv2-btn").onclick = () => { playClickSfx(); goLv2(); };
  document.getElementById("lv3-btn").onclick = () => { playClickSfx(); goLv3(); };
  document.getElementById("reset-btn").onclick = () => { playClickSfx(); setReset(); };
  document.getElementById("apply-btn").onclick = () => { playClickSfx(); setApply(); };
  document.getElementById("back-btn2").onclick = () => { playClickSfx(); backSetting(); };
  document.getElementById("restart-btn").onclick = () => { playClickSfx(); restart(); };
  document.getElementById("game-main-yes-btn").onclick=() => { playClickSfx(); gameToMain(); };
  document.getElementById("game-main-no-btn").onclick=() => { playClickSfx(); gameToMainNo(); };
  document.getElementById("skip-btn").onclick=() => { playClickSfx(); introToMain(); };
  clickSfx.preload = "auto";
  clickSfx.load();  // 명시적 로드

  const introParagraphs = document.querySelectorAll("#intro p");

  let currentIndex = 0;
  let isTyping = false;
  let currentTimeout;
  let currentText = "";
  let currentElement = null;
  let waitTimeout = null;

  function typeText(element, text, speed = 50, callback) {
    let idx = 0;
    isTyping = true;
    currentElement = element;
    currentText = text;
    element.textContent = "";
    element.style.display = "block";

    function typeChar() {
      if (idx < text.length) {
        element.textContent += text.charAt(idx);
        idx++;
        currentTimeout = setTimeout(typeChar, speed);
      } else {
        isTyping = false;
        if (callback) callback();
      }
    }

    typeChar();
  }

  function showNextParagraph() {
    if (currentIndex >= introParagraphs.length) {
      goMain();
      playBgm(0);
      return;
    }

    const p = introParagraphs[currentIndex];
    const text = p.getAttribute("data-text");

    typeText(p, text, 50, () => {
      // 5초 기다렸다가 다음 문장
      waitTimeout = setTimeout(() => {
        p.style.display = "none";
        currentIndex++;
        showNextParagraph();
      }, 5000);
    });
  }

  // 사용자가 넘길 수 있도록
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();

      if(index==5){
      if (isTyping) {
        // 타이핑 중이면 즉시 완료
        clearTimeout(currentTimeout);
        currentElement.textContent = currentText;
        isTyping = false;
      } else {
        // 타이핑이 끝났고 기다리는 중이면 즉시 다음 문장으로
        clearTimeout(waitTimeout);
        if (currentElement) currentElement.style.display = "none";
        currentIndex++;
        showNextParagraph();
      }
    }else if(index==2&&paused==false&&clickGameToMain==false){ //스페이스바 이벤트라서 여기에 일시정지 기능도 추가함.
      pause();
    }else if(index==2&&paused==true&&clickGameToMain==false){
      resume();
    }
    }
  });

  // 시작
  showNextParagraph();
}
//여기까지 pageLoad()


var index = 5; //현재 페이지의 인덱스 저장
var page=["main-menu","select-level","game","setting","game-over", "intro", "epilogue"] // 페이지 추가는 맨뒤에 해주세요
var level= 0; //선택 난이도
let ballColor = "#FFFFFF"; //공 색상
let brickColor = "5F5F5FF"; //벽돌 색상
let volume = 0.5; // 초기 볼륨.
const initialTimes = {
  1: 300,
  2: 350,
  3: 400
};

document.addEventListener("click", function (e) { // 게임화면에서 메인메뉴버튼 여러개라서 이걸로 한꺼번에 처리함
if (e.target.classList.contains("game-main-btn")) {
  clickGameToMain=true;
  playClickSfx();
  document.getElementById("gameToMain").style.display="block";
  paused=true;
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
  clickGameToMain=false;
  paused=false;
  document.getElementById("gameToMain").style.display="none";
  document.getElementById("pause").style.display="none";
  goMain();
  playBgm(0);
  clearInterval(timerId);
}
function gameToMainNo(){
  clickGameToMain=false;
  paused=false;
  document.getElementById("gameToMain").style.display="none";
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
function playClickSfx() { // 클릭 효과음 함수
  clickSfx.pause();           // 정지하고
  clickSfx.currentTime = 0;   // 되감고
  clickSfx.play();            // 재생
}
let tempColor="#FFFFFF";
let tempBrickColor="#5F5F5F";
function setReset(){
	tempVolume=0.5;
  tempColor= colorPicker.value ="#FFFFFF"
  tempBrickColor= brickPicker.value ="#5F5F5F"
  currentBgm.volume = tempVolume;
	document.getElementById("volume-range").value = tempVolume;
}
function setApply(){
	volume=tempVolume;
  ballColor=tempColor;
  brickColor=tempBrickColor;
  clickSfx.volume = volume; // 클릭 효과음 볼륨 설정  
  goMain();
}
function backSetting(){
  currentBgm.volume = volume;
  tempVolume = document.getElementById("volume-range").value = volume;
  tempColor = colorPicker.value = ballColor;
  tempBrickColor= brickPicker.value =brickColor;
  goMain();
}

//일시 정지
let paused=false;
function pause(){
  playClickSfx();
  paused=true;
  document.getElementById("pause").style.display="block";
}
function resume(){
  playClickSfx();
  paused=false;
  document.getElementById("pause").style.display="none";
}

//게임 오버
function gameOver(){
    changePage(4);
}
function restart(){
    changePage(2);
}

// 게임 시작 (여기부터 게임 구현), 참고: level= 1,2,3 난이도 저장되어있음, 벽돌 색상은 brickColor, 공 색상은 ballColor에 지정.
// ****************setInterval할때 반드시 paused==false 체크해주세요!!!!!!!!!!
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
    if(paused==false){
    left -= 1;
    timeLeftEl.innerHTML = left;

    if (left <= 0) {
      clearInterval(timerId);
      timerId = null;
      gameOver();
    }
  }
  }, 1000);
}

