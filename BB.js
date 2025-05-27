window.onload = pageLoad;

let colorPicker;
let brickPicker;
const clickSfx = new Audio("sound/click.mp3");
clickSfx.volume = 0.5; // 클릭 효과음 초기값 설정
let clickGameToMain=false; // pause랑 main 안 겹치게 체크

let introParagraphs;
let epilogueParagraphs;

let isTyping;
let currentTimeout;
let currentText;
let currentElement;
let waitTimeout;

let currentIndex;
let currentImageIndex;
let totalImages;

let spaceLock = false;

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
  brickPicker.addEventListener("input", (e) => { //벽돌 색상 변경
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
  document.getElementById("game-over-main-btn").onclick=() => { playClickSfx(); overToMain(); };
  document.getElementById("game-main-yes-btn").onclick=() => { playClickSfx(); gameToMain(); };
  document.getElementById("game-main-no-btn").onclick=() => { playClickSfx(); gameToMainNo(); };
  document.getElementById("skip-btn1").onclick=() => { playClickSfx(); storyToMain(); };
  document.getElementById("skip-btn2").onclick=() => { playClickSfx(); storyToMain(); };
  // document.getElementById("epilogue-btn").onclick=() => { playClickSfx(); changePage(6); };
  clickSfx.preload = "auto";
  clickSfx.load();  // 명시적 로드

  introParagraphs = document.querySelectorAll("#intro p");

  currentIndex = 0;
  isTyping = false;
  currentTimeout = null;
  currentText = "";
  currentElement = null;
  waitTimeout = null;

  currentImageIndex = 0;
  totalImages = 9;

  document.getElementById("intro-image1").classList.add("visible");
  showNextParagraph();
}
// 여기까지 pageLoad()

// 인트로/에필로그 관련 메소드들
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
  if(index==5 || index==6) {
    const paragraphs = index == 5 ? introParagraphs : epilogueParagraphs;

    if (currentIndex >= paragraphs.length) {
      initStory();
      return;
    }

    const p = paragraphs[currentIndex];
    const text = p.getAttribute("data-text");

    showNextImage(); // 자동으로 index에 따라 처리됨

    typeText(p, text, 50, () => {
      waitTimeout = setTimeout(() => {
        p.style.display = "none";
        currentIndex++;
        showNextParagraph();
      }, 5000);
    });
  }
}

// 사용자가 넘길 수 있도록
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();

    // 연타 방지
    if (spaceLock) return;
    spaceLock = true;
    setTimeout(() => spaceLock = false, 300); 

    if(index==5 || index==6){
      if (isTyping) {
        clearTimeout(currentTimeout);
        currentElement.textContent = currentText;
        isTyping = false;

        waitTimeout = setTimeout(() => {
          if (currentElement) currentElement.style.display = "none";
          currentIndex++;
          showNextParagraph();
        }, 10000);
      } else {
        clearTimeout(waitTimeout);
        if (currentElement) currentElement.style.display = "none";
        currentIndex++;
        showNextParagraph();
      }
    } else if(index==2 && paused==false && clickGameToMain==false){
      pause();
    } else if(index==2 && paused==true && clickGameToMain==false){
      resume();
    }
  }
});

async function showImage(i) {
  if(index==5 || index==6) {
    const imgPrefix = index == 5 ? "intro-image" : "epilogue-image";

    let prevImage = document.getElementById(imgPrefix + currentImageIndex);
    let nextImage = document.getElementById(imgPrefix + i);

    // 페이드 아웃
    prevImage.classList.remove("visible");

    await delay(200);

    // 페이드 인
    nextImage.classList.add("visible");

    currentImageIndex = i;
  }
}

function showNextImage() {
  let nextImageIndex = currentImageIndex + 1;
  if (nextImageIndex > totalImages) nextImageIndex = 1;

  showImage(nextImageIndex);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var index = 5; //현재 페이지의 인덱스 저장
var page=["main-menu","select-level","game","setting","game-over", "intro", "epilogue"] // 페이지 추가는 맨뒤에 해주세요
var level= 0; //선택 난이도
let ballColor = "#FFFFFF"; //공 색상
let brickColor = "#5F5F5F"; //벽돌 색상
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
  pause();
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

  if(i==2){ // 게임 시작
    document.getElementById("level"+level).style.display="block";
    playBgm(level);
    gameStart(level);
  }

  if(i==6) {
    epilogueParagraphs = document.querySelectorAll("#epilogue p");

    currentIndex = 0;
    isTyping = false;
    currentTimeout = null;
    currentText = "";
    currentElement = null;
    waitTimeout = null;

    currentImageIndex = 0;
    totalImages = 5;

    showNextParagraph();
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
function overToMain(){
  document.getElementById("gameToMain").style.display="block";
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
  document.getElementById("gameToMain").style.display="none";
  requestAnimationFrame(draw);
}
function storyToMain() {
  const result = confirm("스토리를 건너뛰시겠습니까?");
  if (result) {
    initStory();
    return;
  }
}
function initStory() {
  clearTimeout(waitTimeout);
  clearTimeout(currentTimeout);

  if (index === 5 || index === 6) {
    const imgPrefix = index === 5 ? "intro-image" : "epilogue-image";
    const paragraphs = index === 5 ? introParagraphs : epilogueParagraphs;

    // 모든 이미지 숨김
    for (let i = 1; i <= totalImages; i++) {
      const img = document.getElementById(imgPrefix + i);
      if (img) img.classList.remove("visible");
    }

    // 모든 문단 숨김 및 초기화
    paragraphs.forEach(p => {
      p.style.display = "none";
      p.textContent = ""; // 타이핑 중이던 텍스트도 지움
    });

    isTyping = false;
    currentIndex = 0;
    currentElement = null;
    currentText = "";
  }

  goMain();
  playBgm(0);
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
  requestAnimationFrame(draw);
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
// 게임 시작 (여기부터 게임 구현), 참고: level= 1,2,3 난이도 저장되어있음, 벽돌 색상은 brickColor, 공 색상은 ballColor에 지정.
// ****************setInterval할때 반드시 paused==false 체크해주세요!!!!!!!!!!
const paddleHeight = 10,
paddleWidth      = 200,
brickColumnCount = 8,
brickHeight      = 20,
initialBrickRows = 3;

let canvas, ctx, paddleX;
let bricks = [], brickRowCount, brickWidth;
let ballRadius = 8, x, y, dx, dy;
let rightPressed=false, leftPressed=false;
let timerId=null, addRowIntervalId=null;

const charImg = new Image();
charImg.src = "image/InGameCharacterDefault.png";

// ──────────── 3) 게임 시작 (여기부터 게임 구현) ────────────
function gameStart(level) {
  // 초기화
  if(timerId){ clearInterval(timerId); timerId=null; }
  if(addRowIntervalId){ clearInterval(addRowIntervalId); addRowIntervalId=null; }

  // 남은 시간
  const sec = document.getElementById("level"+level).querySelector(".time-left");
  let left = initialTimes[level];   // ex) 1단계 : 300초
  sec.textContent = left;
  timerId = setInterval(()=>{
    if(!paused){
      left--; sec.textContent=left;
      if(left<=0){ clearInterval(timerId); timerId=null; gameOver(); }
    }
  },1000);

  // canvas
  const lv = document.getElementById("level"+level);
  canvas = lv.querySelector("canvas");
  ctx    = canvas.getContext("2d");

  canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();  // <canvas>가 차지하는 영역의 위치와 크기 정보를 구함
  // 마우스 X 좌표를 캔버스 기준으로 계산
  const mx = e.clientX - rect.left;
  // 패들 중앙이 마우스 위치에 오도록
  paddleX = mx - paddleWidth / 2;
  // 패들이 캔버스 바깥으로 나가지 않도록 경계 체크
  if (paddleX < 0) paddleX = 0;
  if (paddleX > canvas.width - paddleWidth) paddleX = canvas.width - paddleWidth;
});

  // 공/패들
  paddleX = (canvas.width-paddleWidth)/2;
  x = canvas.width/2; y = canvas.height-30;
  dx = 2 + level*0.5; dy = -(2 + level * 0.5);

  // 벽돌
  brickRowCount = initialBrickRows;
  initBricks();
  addRowIntervalId = setInterval(()=>{    // 벽돌 10초에 한줄씩 추가
    if(!paused) addBrickRow();
  }, 10000);

  // 시작
  paused = false;
  requestAnimationFrame(draw);  // draw 함수에서 재호출
}

// 벽돌 배열 초기화
function initBricks(){
  bricks=[]; brickWidth=canvas.width/brickColumnCount;
  for(let c=0;c<brickColumnCount;c++){
    bricks[c]=[];
    for(let r=0;r<brickRowCount;r++){
      bricks[c][r]={status:1};
    }
  }
}
// 벽돌 위에서 한줄 추가
function addBrickRow(){
  brickRowCount++;
  for(let c=0;c<brickColumnCount;c++){
    bricks[c].unshift({status:1});
  }
}

// 그리기 루프
function draw(){

  const imgW = 50;  // 캐릭터 너비
  const imgH = 75;  // 캐릭터 높이
  

  if(paused) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);    // 캔버스 지우기
  // 벽돌
  ctx.fillStyle=brickColor;
  for(let c=0;c<brickColumnCount;c++){
    for(let r=0;r<bricks[c].length;r++){
      if(bricks[c][r].status){
        const bx=c*brickWidth, by=r*brickHeight;
        ctx.fillRect(bx+1,by+1,brickWidth-2,brickHeight-2);
      }
    }
  }
  // 공
  ctx.beginPath();
  ctx.arc(x,y,ballRadius,0,Math.PI*2);
  ctx.fillStyle=ballColor;
  ctx.fill(); ctx.closePath();

  // 충돌
  for(let c=0;c<brickColumnCount;c++){        // 벽돌 충돌
    for(let r=0;r<bricks[c].length;r++){
      let b=bricks[c][r];
      if(b.status && x>c*brickWidth && x<c*brickWidth+brickWidth &&
         y>r*brickHeight && y<r*brickHeight+brickHeight){
        dy=-dy; b.status=0;
      }
    }
  }

const nextX     = x + dx;
const nextY     = y + dy;
const paddleTop = canvas.height - paddleHeight - imgH + 20;

// 1) 좌우 벽 충돌
if (nextX + ballRadius > canvas.width || nextX - ballRadius < 0) {
  dx = -dx;
}
// 2) 천장 충돌
else if (nextY - ballRadius < 0) {
  dy = -dy;
}
// 3) 패들 충돌
else if (nextY + ballRadius >= paddleTop) {
  if (nextX > paddleX && nextX < paddleX + paddleWidth) {
    dy = -dy;
    // 공이 패들 아래로 내려가지 않도록
    y  = paddleTop - ballRadius;
  }
}

// 4) 바닥 충돌 (항상 검사)
if (nextY + ballRadius > canvas.height) {
  gameOver();
  return;
}

  if (charImg.complete) {
    const imgX = paddleX + (paddleWidth - imgW) / 2;
    const imgY = canvas.height - imgH;
    ctx.drawImage(charImg, imgX, imgY, imgW, imgH);
  }

  // 패들
  ctx.beginPath();
  ctx.rect(paddleX,canvas.height-paddleHeight-imgH + 20,paddleWidth,paddleHeight);
  ctx.fillStyle="white"; ctx.fill(); ctx.closePath();

  // 이동
  x+=dx; y+=dy;
  requestAnimationFrame(draw);
}


