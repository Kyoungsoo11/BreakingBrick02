window.onload = pageLoad;

let colorPicker;
let brickPicker;
const clickSfx = new Audio("sound/click.mp3");
const keyboard = new Audio("sound/keyboard.mp3");
clickSfx.volume = 0.5; // 클릭 효과음 초기값 설정
let clickGameToMain = false; // pause랑 main 안 겹치게 체크
let volume = 0.5; // 초기 볼륨.
let isGameOver = false;

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

function pageLoad() {
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
  document.getElementById("game-over-main-btn").onclick = () => { playClickSfx(); overToMain(); };
  document.getElementById("game-clear-main-btn").onclick = () => { playClickSfx(); clearToMain(); };
  document.getElementById("game-main-yes-btn").onclick = () => { playClickSfx(); gameToMain(); };
  document.getElementById("game-main-no-btn").onclick = () => { playClickSfx(); gameToMainNo(); };
  document.getElementById("skip-btn1").onclick = () => { playClickSfx(); storyToMain(); };
  document.getElementById("skip-btn2").onclick = () => { playClickSfx(); storyToMain(); };
  document.getElementById("next-level-btn").onclick = () => { playClickSfx(); goNextLevel(); };
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
      if (keyboard.paused && audioInitialized == true) startKeyboardSfx();
      currentTimeout = setTimeout(typeChar, speed);
    } else {
      stopKeyboardSfx();
      isTyping = false;
      if (callback) callback();
    }
  }

  typeChar();
}

function showNextParagraph() {
  if (index == 5 || index == 6) {
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

    if (index == 5 || index == 6) {
      if (isTyping) {
        clearTimeout(currentTimeout);
        stopKeyboardSfx();
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
    } else if (index == 2 && paused == false && clickGameToMain == false) {
      pause();
    } else if (index == 2 && paused == true && clickGameToMain == false) {
      resume();
    }
  }else if(e.code === "Delete"){
    if(index==2&&step<65){
      let calStep=65-step;
      step=65;
      left=left-calStep;
    }
  }else if(e.code === "End"){
    if(index==2&&step>65){
      boss.hp=0;
    }
  }
});

async function showImage(i) {
  if (index == 5 || index == 6) {
    const imgPrefix = index == 5 ? "intro-image" : "epilogue-image";

    let prevImage = document.getElementById(imgPrefix + currentImageIndex);
    let nextImage = document.getElementById(imgPrefix + i);

    // 페이드 아웃
    prevImage.classList.remove("visible");

    await delay(200);

    // 페이드 인
    nextImage.classList.add("visible");

    if (index == 5 && i == 5) {
      playBgm(5);
    }

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

function startBumpSfx() {
  const bumpSfx = new Audio("sound/bump.mp3");
  bumpSfx.volume = volume;
  bumpSfx.currentTime = 0;
  bumpSfx.play();
}
function bossAtkSfx() {
  const bossAtkSfx = new Audio("sound/boss"+level+"atk.mp3");
  bossAtkSfx.volume = volume;
  bossAtkSfx.currentTime = 0;
  bossAtkSfx.play();
}
function startShieldSfx() {
  const shieldSfx = new Audio("sound/shield.mp3");
  shieldSfx.volume = volume;
  shieldSfx.currentTime = 0;
  shieldSfx.play();
}
function startDamageSfx() {
  const damageSfx = new Audio("sound/damage.mp3");
  damageSfx.volume = volume;
  damageSfx.currentTime = 0;
  damageSfx.play();
}

function startKeyboardSfx() {
  if (!keyboard.paused) return;
  keyboard.loop = true;
  keyboard.volume = volume * 0.5;
  keyboard.currentTime = 0;
  keyboard.play();
}

function stopKeyboardSfx() {
  keyboard.pause();
  keyboard.currentTime = 0;
}

var index = 7; //현재 페이지의 인덱스 저장
var page = ["main-menu", "select-level", "game", "setting", "game-over", "intro", "epilogue", "start-screen", "game-clear"]; // 페이지 추가는 맨뒤에 해주세요
var level = 0;
let ballColor = "#FFFFFF"; //공 색상
let brickColor = "#5F5F5F"; //벽돌 색상
const initialTimes = {
  1: 150,
  2: 165,
  3: 180
};

document.addEventListener("click", function (e) { // 게임화면에서 메인메뉴버튼 여러개라서 이걸로 한꺼번에 처리함
  if (e.target.classList.contains("game-main-btn")) {
    clickGameToMain = true;
    playClickSfx();
    document.getElementById("gameToMain").style.display = "block";
    pause();
  }
});

let audioInitialized = false; //최초 음악 재생은 바디 클릭시 실행한다.
document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener("click", function () {
    if (!audioInitialized) {
      playBgm(4);
      audioInitialized = true;
      goIntro();
    }
  });
});

//메뉴 선택에 따른 페이지 변경
function changePage(i) {
  if (index == 2) {
    document.getElementById("level" + level).style.display = "none";
  }
  document.getElementById(page[index]).style.display = "none";
  index = i;
  document.getElementById(page[index]).style.display = "block";

  if (i == 2) { // 게임 시작
    document.getElementById("level" + level).style.display = "block";
    playBgm(level);
    gameStart(level);
  }

  if (i == 6) {
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
function goStart() {
  changePage(1);
}
function goMain() {
  changePage(0);
}
function goSetting() {
  changePage(3);
}
function goQuit() {
  const result = confirm("정말 게임을 종료하시겠습니까?");
  if (result) {
    window.close();
  } else return;
}
function goLv1() {
  level = 1;
  changePage(2);
}
function goLv2() {
  level = 2;
  changePage(2);
}
function goLv3() {
  level = 3;
  changePage(2);
}
function goNextLevel() { //클리어 후 다음 레벨로 
  // 보스 상태 초기화
  initBoss();
  gameFlag = false;
  ballAttached = false;
  paused = false;
  document.getElementById("gameToMain").style.display="none";
  document.getElementById("pause").style.display="none";

  if (level == 3) {
    document.getElementById("next-level-btn").innerHTML = "Next Level";
    document.getElementById("game-clear-main-btn").style.display = "block";
  }
  document.getElementById("game-clear").style.display = "none";
  if (level >= 3) {
    changePage(6); //에필로그 실행
    playBgm(6);
  } else {
    stopAllTimers();
    changePage(0);
    level++;
    changePage(2);
  }
}
function goIntro() {
  changePage(5);
  document.getElementById("intro-image1").classList.add("visible");
  showNextParagraph();
}
function clearToMain() {
  gameFlag = false;
  ballAttached = false;
  document.getElementById("game-clear").style.display = "none";
  goMain();
  playBgm(0);
  paused = false;
}
function overToMain() {
  stopAllTimers();
  document.getElementById("gameToMain").style.display = "block";
}
function gameToMain() {
  projectiles = [];
  clickGameToMain = false;
  paused = false;
  isGameOver = false;
  document.getElementById("gameToMain").style.display = "none";
  document.getElementById("pause").style.display = "none";
  clearInterval(stopWatchId);
  step = 0;
  goMain();
  playBgm(0);
  gameFlag = false;
  ballAttached = false;
  clearInterval(timerId);
}
function gameToMainNo() {
  clickGameToMain = false;
  document.getElementById("gameToMain").style.display = "none";
  if (!isGameOver) {
    requestAnimationFrame(draw);
  }
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

    stopKeyboardSfx();

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

function dangerInfo() {
  const info = document.getElementById("level" + level);
  info.querySelector(".pause-info").innerHTML = "&lt; Danger! Danger! Here comes the boss! &gt;";
  info.querySelector(".pause-info").style.color = "red";
  info.querySelector(".game-area").style.boxShadow = "0 0 10px red";
  info.querySelector(".game-area").style.border = "2px solid red";
  info.querySelector(".game-info").style.boxShadow = "0 0 10px red";
  info.querySelector(".game-info").style.border = "2px solid red";
}

function dangerClear() {
  const info = document.getElementById("level" + level);
  info.querySelector(".pause-info").innerHTML = "&lt; press Space to pause &gt;";
  info.querySelector(".pause-info").style.color = "white";
  info.querySelector(".game-area").style.boxShadow = "0 0 10px white";
  info.querySelector(".game-area").style.border = "2px solid white";
  info.querySelector(".game-info").style.boxShadow = "0 0 10px white";
  info.querySelector(".game-info").style.border = "2px solid white";
}

// setting 관련
const mainBgm = new Audio("sound/main.mp3");
const lv1Bgm = new Audio("sound/lv1.mp3");
const lv2Bgm = new Audio("sound/lv2.mp3");
const lv3Bgm = new Audio("sound/lv3.mp3");
const IntroSound1 = new Audio("sound/IntroSound1.mp3");
const IntroSound2 = new Audio("sound/IntroSound2.mp3");
const epilogueSound = new Audio("sound/epilogueSound.mp3");
const boss1Bgm = new Audio("sound/lv1boss.mp3");
const boss2Bgm = new Audio("sound/lv2boss.mp3");
const boss3Bgm = new Audio("sound/lv3boss.mp3");
const overBgm = new Audio("sound/gameover.mp3");
const bgmList = [mainBgm, lv1Bgm, lv2Bgm, lv3Bgm, IntroSound1, IntroSound2, epilogueSound, boss1Bgm, boss2Bgm, boss3Bgm, overBgm]; //난이도랑 인덱스랑 맞춰놓음. 789가 bossbgm
let currentBgm = mainBgm; // 현재 재생 중인 음악 추적용
let tempVolume = 0.5;
bgmList.forEach(bgm => {
  bgm.loop = true;
  bgm.volume = volume;
});
function playBgm(i) { //음악 재생 함수
  if (currentBgm) currentBgm.pause();
  currentBgm = bgmList[i];
  if (i > 6 && i < 10) { //볼륨조절용
    currentBgm.volume = volume * 0.5;
  } else {
    currentBgm.volume = volume;
  }
  currentBgm.currentTime = 0;
  currentBgm.play();
}
function playClickSfx() { // 클릭 효과음 함수
  clickSfx.pause();           // 정지하고
  clickSfx.currentTime = 0;   // 되감고
  clickSfx.play();            // 재생
}
let tempColor = "#FFFFFF";
let tempBrickColor = "#5F5F5F";
function setReset() {
  tempVolume = 0.5;
  tempColor = colorPicker.value = "#FFFFFF"
  tempBrickColor = brickPicker.value = "#5F5F5F"
  currentBgm.volume = tempVolume;
  document.getElementById("volume-range").value = tempVolume;
}
function setApply() {
  volume = tempVolume;
  ballColor = tempColor;
  brickColor = tempBrickColor;
  clickSfx.volume = volume; // 클릭 효과음 볼륨 설정  
  goMain();
}
function backSetting() {
  currentBgm.volume = volume;
  tempVolume = document.getElementById("volume-range").value = volume;
  tempColor = colorPicker.value = ballColor;
  tempBrickColor = brickPicker.value = brickColor;
  goMain();
}

//일시 정지
let paused = false;
function pause() {
  playClickSfx();
  paused = true;
  document.getElementById("pause").style.display = "block";
}
function resume() {
  playClickSfx();
  paused = false;
  document.getElementById("pause").style.display = "none";
  requestAnimationFrame(draw);
}

//게임 오버
function gameOver() {
  const info = document.getElementById(`level${level}`);
  const lifeEl = info.querySelector(".current-life");
  let currentLife = parseInt(lifeEl.textContent);
  if (currentLife <= 4) {
    paddleWidth -= 40;
  }
  currentLife--;  // 목숨 1 깎기
  lifeEl.textContent = currentLife;

  if (currentLife <= 0 || left <= 0) {
    // 게임 오버 직전에 best score 갱신
    isGameOver = true;
    ballAttached = false;
    playBgm(10);
    if (score > bestScores[level]) {
      bestScores[level] = score;
    }
    // 정보영역 best-score 업데이트
    document
      .getElementById(`level${level}`)
      .querySelector(".best-score")
      .textContent = bestScores[level];
    changePage(4);

    gameFlag = false;
    clearInterval(stopWatchId);
    step = 0;
  }
  else {
    // 공의 상태만 게임 처음 시작처럼 초기화
    // (목숨은 깎지 않고, 벽돌/점수/시간 등은 그대로)
    // paddleX, x, y, dx, dy만 재설정
    startDamageSfx();
    ballAttached = true;
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 0;           // 공 속도 dx
    dy = 0;        // 공 속도 dy
    paused = false;
    requestAnimationFrame(draw);
  }
}
function restart() {
  isGameOver = false;
  clearInterval(stopWatchId);
  clearInterval(timerId);
  step = 0;
  gameFlag = false;
  ballAttached = false;
  changePage(2);
}
function gameClear() { // 게임 클리어 함수. 나중에 텍스트 수정 구현
  document.getElementById("pause").style.display = "none";
  clearInterval(stopWatchId);
  paused = true;

  let scoreSum = 0;
  // Clear Time 계산 & 반영
  const clearTime = step;
  document.getElementById("clear-time").textContent = clearTime + "\t· · ·  " + left + " * 10 = " + left * 10;
  step = 0;

  // Life 반영
  const lifeEl = document.querySelector(
    `#level${level} .current-life`
  );
  const life = parseInt(lifeEl.textContent, 10);
  document.querySelector("#game-clear .current-life").textContent = life + "\t· · ·  " + life + " * 300 = " + life * 300;

  scoreSum = left * 10 + life * 300;
  // Current Score 반영
  document.querySelector("#game-clear .current-score").textContent = score + "\t· · ·  + " + scoreSum + " + 5000" + " = " + (scoreSum + score + 5000);

  score += scoreSum + 5000;
  scoreSum = score - bestScores[level];
  let plusMinus = ""
  // Best Score 갱신 & 반영
  if (score > bestScores[level]) {
    bestScores[level] = score;
    plusMinus = "+"
  }
  document.querySelector("#game-clear .best-score").textContent = bestScores[level] + "\t· · ·  " + score + " [" + plusMinus + scoreSum + "]";

  if (level == 3) { // 난이도 3 클리어일 경우 next버튼만 나오게.
    document.getElementById("next-level-btn").innerHTML = "Next";
    document.getElementById("game-clear-main-btn").style.display = "none";
  }
  document.getElementById("game-clear").style.display = "block";
}
// 게임 시작 (여기부터 게임 구현), 참고: level= 1,2,3 난이도 저장되어있음, 벽돌 색상은 brickColor, 공 색상은 ballColor에 지정.
// ****************setInterval할때 반드시 paused==false 체크해주세요!!!!!!!!!!
const paddleHeight = 10,
  brickColumnCount = 8,
  brickHeight = 20,
  initialBrickRows = 3;

let paddleWidth = 170;
let canvas, ctx, paddleX;
let bricks = [], brickRowCount, brickWidth;
let ballRadius = 8, x, y, dx, dy;
let rightPressed = false, leftPressed = false;
let timerId = null, stopWatchId = null;
let score = 0;
const bestScores = { 1: 0, 2: 0, 3: 0 };  // 레벨별 bestScores 객체 선언

const charImg = new Image();
charImg.src = "image/InGameCharacterDefault.png";

// ──────────── 3) 게임 시작 (여기부터 게임 구현) ────────────
let gameFlag;
let left;
let step;
let availableAttack;
let availableDamage;
let availableInv;

let damageEnable = false;
let invEnable = false;

let damageCool = false;
let attackCool = false;
let invCool = false;

let damageSec;
let attackSec;
let invSec;

let damageTimerId;
let attackTimerId;
let invTimerId;

let projectiles = [];

const imgW = 50;  // 캐릭터 너비
const imgH = 60;  // 캐릭터 높이
let ballAttached = false;

const itemTypes = [
  { type: "lifeAdd", image: new Image(), outlineColor: "#1bffca" },     // 초록
  { type: "timeAdd", image: new Image(), outlineColor: "#1bffca" },  // 초록
  { type: "damageBuff", image: new Image(), outlineColor: "#f6ff08" },  // 노랑
  { type: "attack", image: new Image(), outlineColor: "#f6ff08" }, // 노랑
  { type: "invisiblity", image: new Image(), outlineColor: "#f6ff08" }    // 노랑
];

itemTypes[0].image.src = "image/item/LifeAdd.jpg";
itemTypes[1].image.src = "image/item/TimeAdd.jpg";
itemTypes[2].image.src = "image/item/DamageBuff.jpg";
itemTypes[3].image.src = "image/item/Attack.jpg";
itemTypes[4].image.src = "image/item/Invisiblity.jpg";

function makeRandomItemBrick() {
  const activeBricks = [];
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      const b = bricks[c][r];
      if (b.status === 1 && !b.isItem) {
        activeBricks.push({ c, r });
      }
    }
  }

  if (activeBricks.length === 0) return;

  // 랜덤한 벽돌 하나 선택
  const { c, r } = activeBricks[Math.floor(Math.random() * activeBricks.length)];

  // 랜덤한 아이템 하나 선택 (20% 확률 균등)
  const selectedItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];

  bricks[c][r].isItem = true;
  bricks[c][r].itemType = selectedItem.type;
  bricks[c][r].itemImage = selectedItem.image;
  bricks[c][r].outlineColor = selectedItem.outlineColor;
}

function applyItemEffect(type) {
  switch (type) {
    case "lifeAdd":
      lifeAdd();
      break;
    case "timeAdd":
      timeAdd();
      break;
    case "damageBuff":
      damageBuff(1);
      break;
    case "attack":
      attack(1);
      break;
    case "invisiblity":
      invisiblity(1);
      break;
    default:
      console.warn("알 수 없는 아이템 타입:", type);
  }
}

function initItem() {
  damageBuff('I');
  attack('I');
  invisiblity('I');
}

function startLifeSfx() {
  const lif = new Audio("sound/life.mp3");
  lif.volume = volume;
  lif.play();
}

function startClockSfx() {
  const clk = new Audio("sound/clock.mp3");
  clk.volume = volume;
  clk.play();
}

function startAtkSfx() {
  const atk = new Audio("sound/attack.mp3");
  atk.volume = volume;
  atk.play();
}

function startInvSfx() {
  const inv = new Audio("sound/inv.mp3");
  inv.volume = volume;
  inv.play();
}

function startBuffSfx() {
  const buff = new Audio("sound/buff.mp3");
  buff.volume = volume;
  buff.play();
}

function startDgrSfx() {
  const danger = new Audio("sound/danger.mp3");
  danger.volume = volume;
  danger.play();
}

function lifeAdd() {
  const info = document.getElementById(`level${level}`);
  const lifeEl = info.querySelector(".current-life");
  let currentLife = parseInt(lifeEl.textContent);
  if (currentLife < 4) {
    paddleWidth += 40;
  }
  currentLife++;
  lifeEl.textContent = currentLife;
  startLifeSfx();
}

function timeAdd() {
  startClockSfx();
  left += 10;
}

function stopAllTimers() {
  if (damageTimerId) {
    clearInterval(damageTimerId);
    damageTimerId = null;
    damageEnable = false;
    damageCool = false;
    document.querySelector(".damageBuff-time").textContent = "'S'";
    document.querySelector(".damageBuff-time").style.color = "white";
  }
  if (attackTimerId) {
    clearInterval(attackTimerId);
    attackTimerId = null;
    attackCool = false;
    document.querySelector(".attack-time").textContent = "'A'";
    document.querySelector(".attack-time").style.color = "white";
  }
  if (invTimerId) {
    clearInterval(invTimerId);
    invTimerId = null;
    invEnable = false;
    invCool = false;
    document.querySelector(".invisiblity-time").textContent = "'D'";
    document.querySelector(".invisiblity-time").style.color = "white";
  }
}

function damageBuff(i) {
  const info = document.getElementById(`level${level}`);
  const damageEl = info.querySelector(".damageBuff-status");
  availableDamage = parseInt(damageEl.textContent);
  if (i == 'I') {
    if (level == 1 || level == 2) availableDamage = 1;
    else if (level == 3) availableDamage = 0;
  } else {
    availableDamage += i;
  }
  damageEl.textContent = availableDamage;
}

function attack(i) {
  const info = document.getElementById(`level${level}`);
  const attackEl = info.querySelector(".attack-status");
  availableAttack = parseInt(attackEl.textContent);
  if (i == 'I') {
    if (level == 1 || level == 2) availableAttack = 1;
    else if (level == 3) availableAttack = 0;
  } else {
    availableAttack += i;
  }
  attackEl.textContent = availableAttack;
}

function invisiblity(i) {
  const info = document.getElementById(`level${level}`);
  const invEl = info.querySelector(".invisiblity-status");
  availableInv = parseInt(invEl.textContent);
  if (i == 'I') {
    if (level == 1) availableInv = 1;
    else if (level == 2 || level == 3) availableInv = 0;
  } else {
    availableInv += i;
  }
  invEl.textContent = availableInv;
}

function damageTime(i) {
  damageSec = i;
  const sec = document.getElementById("level" + level).querySelector(".damageBuff-time");
  sec.textContent = damageSec;
  damageTimerId = setInterval(() => {
    if (!paused) {
      damageSec--; sec.textContent = damageSec;
      if (gameFlag == false) {
        clearInterval(damageTimerId);
        damageTimerId = null;
        damageEnable = false;
        damageCool = false;
        sec.style.color = "white";
        sec.textContent = '\'S\'';
      }
      if (damageSec <= 0) {
        clearInterval(damageTimerId);
        damageTimerId = null;
        if (damageEnable == true) {
          damageEnable = false;
          sec.style.color = "red";
          damageTime(10);
        } else {
          damageCool = false;
          sec.style.color = "white";
          sec.textContent = '\'S\'';
        }
      }
    }
  }, 1000);
}

function attackTime(i) {
  attackSec = i;
  const sec = document.getElementById("level" + level).querySelector(".attack-time");
  sec.style.color = "red";
  sec.textContent = attackSec;
  attackTimerId = setInterval(() => {
    if (!paused) {
      attackSec--; sec.textContent = attackSec;
      if (gameFlag == false) {
        clearInterval(attackTimerId);
        attackTimerId = null;
        attackCool = false;
        sec.style.color = "white";
        sec.textContent = '\'A\'';
      }
      if (attackSec <= 0) {
        clearInterval(attackTimerId);
        attackTimerId = null;
        attackCool = false;
        sec.style.color = "white";
        sec.textContent = '\'A\'';
      }
    }
  }, 1000);
}

function invTime(i) {
  invSec = i;
  const sec = document.getElementById("level" + level).querySelector(".invisiblity-time");
  sec.textContent = invSec;
  invTimerId = setInterval(() => {
    if (!paused) {
      invSec--; sec.textContent = invSec;
      if (gameFlag == false) {
        clearInterval(invTimerId);
        invTimerId = null;
        invEnable = false;
        invCool = false;
        sec.style.color = "white";
        sec.textContent = '\'D\'';
      }
      if (invSec <= 0) {
        clearInterval(invTimerId);
        invTimerId = null;
        if (invEnable == true) {
          invEnable = false;
          sec.style.color = "red";
          invTime(15);
        } else {
          invCool = false;
          sec.style.color = "white";
          sec.textContent = '\'D\'';
        }
      }
    }
  }, 1000);
}

document.addEventListener("keydown", function (e) {
  if (e.key === "a" || e.key === "A") {
    if (availableAttack > 0 && attackCool == false) {
      attack(-1);
      attackCool = true;
      attackTime(5);
      startAtkSfx();

      const projY = canvas.height - paddleHeight - imgH;
      const projXCenter = paddleX + paddleWidth / 2;

      projectiles.push(createProjectile(projXCenter, projY));
      projectiles.push(createProjectile(projXCenter, projY - 30));
    }
  }

  if (e.key === "s" || e.key === "S") {
    if (availableDamage > 0 && damageCool == false) {
      damageEnable = true;
      damageCool = true;
      damageBuff(-1);
      damageTime(30);
      startBuffSfx();
    }
  }

  if (e.key === "d" || e.key === "D") {
    if (availableInv > 0 && invCool == false) {
      invEnable = true;
      invCool = true;
      invisiblity(-1);
      invTime(15);
      startInvSfx();
    }
  }
});

function createProjectile(x, y) {
  return {
    x,
    y,
    radius: paddleWidth / 2,
    speed: 8,
    projLife: 120,
  };
}

function gameStart(level) {
  projectiles.splice(1, 2);
  gameFlag = true;
  ballAttached = false;
  initBoss();
  dangerClear();
  // 초기화
  if (stopWatchId) { clearInterval(stopWatchId); stopWatchId = null; step = 0; }
  if (timerId) { clearInterval(timerId); timerId = null; }
  initItem();

  const info = document.getElementById(`level${level}`);
  // 레벨별 life/score/best-score 초기화
  info.querySelector(".current-life").textContent = 3;
  info.querySelector(".current-score").textContent = 0;
  info.querySelector(".best-score").textContent = bestScores[level];

  score = 0;
  // 현재 레벨의 current-score 초기화
  document
    .getElementById(`level${level}`)
    .querySelector(".current-score")
    .textContent = 0;
  // 현재 레벨의 best-score 표시**
  document
    .getElementById(`level${level}`)
    .querySelector(".best-score")
    .textContent = bestScores[level];

  // 남은 시간
  const sec = document.getElementById("level" + level).querySelector(".time-left");
  left = initialTimes[level];   // ex) 1단계 : 300초
  sec.textContent = left;
  timerId = setInterval(() => {
    if (!paused) {
      left--; sec.textContent = left;
      if (left <= 0) { clearInterval(timerId); timerId = null; gameOver(); }
    }
  }, 1000);

  // 게임 시작 스톱워치
  step = 0;
  let dgrflag = true;
  stopWatchId = setInterval(() => {
    if (!paused) {
      step++;

      if ((step + 10) % 15 == 0) {
        makeRandomItemBrick();
      }

      if (!boss.active) {                 // 보스 미출현 시 벽돌을 한 줄 씩 추가
        if ((step + 10) % 15 == 0) {
          if (!paused) addBrickRow();
        }
      }

      // 보스 등장 조건 (레벨1이고, 아직 보스 안나왔고, 남은 시간이 150 이하)
      if (!boss.active && step > 65) {
        console.log("보스 등장 경고");
        if (dgrflag) {
          dgrflag = false;
          startDgrSfx();
        }
        dangerInfo();
      }

      if (!boss.active && step > 70) {
        console.log("보스 등장 조건 충족");
        dangerClear();
        loadBossFrames();  // 보스 이미지 프레임 로딩
        spawnBoss();
      }
    }
  }, 1000);

  // canvas 설정 및 마우스 이벤트 등록
  const lv = document.getElementById("level" + level);
  canvas = lv.querySelector("canvas");
  ctx = canvas.getContext("2d");

  canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();  // <canvas>가 차지하는 영역의 위치와 크기 정보를 구함
    const mx = e.clientX - rect.left;             // 마우스 X 좌표를 캔버스 기준으로 계산
    paddleX = mx - paddleWidth / 2;               // 패들 중앙이 마우스 위치에 오도록
    if (paddleX < 0) paddleX = 0;                 // 패들이 캔버스 바깥으로 나가지 않도록 경계 체크
    if (paddleX > canvas.width - paddleWidth) paddleX = canvas.width - paddleWidth;
  });

  // 마우스 클릭으로 공 발사
  canvas.addEventListener("click", () => {
    if (ballAttached) {
      ballAttached = false;
      dx = 3 + level * 1;
      dy = -(3 + level * 1);
    }
  });

  // 공/패들
  paddleX = (canvas.width - paddleWidth) / 2;
  x = canvas.width / 2; y = canvas.height - 30;
  dx = 3 + level * 1; dy = -(3 + level * 1);       // !-- 공 속도 --!
  paddleWidth = 170;

  // 벽돌
  brickRowCount = initialBrickRows;
  initBricks();

  // 시작
  paused = false;
  requestAnimationFrame(draw);  // draw 함수에서 재호출

  //전갈
  if (level === 1) {
    loadBossFrames();  // 전갈 보스 이미지 프레임 로딩
  }

}

// 벽돌 배열 초기화
function initBricks() {
  bricks = []; brickWidth = canvas.width / brickColumnCount;
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
      bricks[c][r] = { status: 1 };
    }
  }
}
// 벽돌 위에서 한줄 추가
function addBrickRow() {
  brickRowCount++;
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c].unshift({ status: 1 });
  }
}
//===================
//  보스 관련 변수 및 함수
let bossProjectiles = [];
function bossAttack() {
  if (!boss.active) return;

  // 2단계: 보스 정면에서 1개
  if (level === 2) {
    const projX = boss.x + boss.width / 2;
    const projY = boss.y + boss.height;
    bossProjectiles.push({
      x: projX,
      y: projY,
      radius: 16,
      dy: 6
    });
  }

  // 3단계: 보스 정면 + 양 옆에서 3개
  if (level === 3) {
    const leftX = boss.x + boss.width * 0.2;
    const centerX = boss.x + boss.width / 2;
    const rightX = boss.x + boss.width * 0.8;
    const projY = boss.y + boss.height;
    bossProjectiles.push({ x: leftX, y: projY, radius: 16, dy: 6 });
    bossProjectiles.push({ x: centerX, y: projY, radius: 16, dy: 6 });
    bossProjectiles.push({ x: rightX, y: projY, radius: 16, dy: 6 });
  }
}

// ========================
//  그리기 함수 draw()
// ========================
function draw() {
  const info = document.getElementById(`level${level}`);
  info.querySelector(".current-score").textContent = score;

  if (paused || left <= 0) return;

  // 캔버스 전체 지워서 이전 프레임 흔적 제거
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 벽돌
  ctx.fillStyle = brickColor;
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      const b = bricks[c][r];
      if (b.status) {
        const bx = c * brickWidth;
        const by = r * brickHeight;

        // 배경색 결정 (아이템 벽돌 or 일반 벽돌)
        if (b.isItem) {
          ctx.fillStyle = "black";  // 아이템 벽돌 내부는 검정
        } else {
          ctx.fillStyle = brickColor;  // 일반 벽돌 색
        }

        ctx.fillRect(bx + 1, by + 1, brickWidth - 2, brickHeight - 2);

        if (b.isItem) {
          // 아이템 벽돌일 때만 테두리 그림
          ctx.strokeStyle = b.outlineColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(bx + 1, by + 1, brickWidth - 2, brickHeight - 2);

          if (b.itemImage?.complete) {
            const imgW = 15, imgH = 15;
            const imgX = bx + (brickWidth - imgW) / 2;
            const imgY = by + (brickHeight - imgH) / 2;
            ctx.drawImage(b.itemImage, imgX, imgY, imgW, imgH);
          }
        }
      }
    }
  }

  //보스 그리기
  if (boss.active) {
    drawBoss();
  }

  function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);

    if (invEnable && damageEnable) {
      ctx.shadowColor = "red";
      ctx.shadowBlur = 30;
      ctx.strokeStyle = ballColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (invEnable) {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = ballColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = ballColor;

      if (damageEnable) {
        ctx.shadowColor = "red";
        ctx.shadowBlur = 30;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fill();
    }

    ctx.closePath();

    // 공 외 오브젝트에 영향 없도록 초기화
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
  }

  // 참격(A) 그리기
  function drawProjectiles() {
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];

      // 반원 위쪽 방향 그리기
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, Math.PI, 0); // 반원
      ctx.strokeStyle = ballColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();

      // 위로 이동
      p.y -= p.speed;
      p.projLife--;

      // 벽돌 충돌 처리
      for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
          let b = bricks[c][r];
          if (!b.status) continue;

          const bx = c * brickWidth;
          const by = r * brickHeight;
          const bw = brickWidth;
          const bh = brickHeight;
          const pr = p.radius;

          if (
            p.x + pr > bx && p.x - pr < bx + bw &&
            p.y + pr > by && p.y - pr < by + bh
          ) {
            startBumpSfx();
            if (!invEnable) {
              projectiles.splice(i, 1);
            }
            b.status = 0;

            

            if (b.isItem) {
              if (damageEnable) {
                score += 300;
              } else {
                score += 200;
              }
              applyItemEffect(b.itemType);
            } else {
              if (damageEnable) {
                score += 200;
              } else {
                score += 100;
              }
            }
            info.querySelector(".current-score").textContent = score;
            break;
          }
        }
      }
      if (checkBossCollision(p.x, p.y, p.radius)) {
        if (!invEnable) {
          projectiles.splice(i, 1);
        }
      }


      if (p.y < -10 || p.projLife <= 0) {
        projectiles.splice(i, 1);
      }
    }
  }

  drawBall();   // 매 프레임(requestAnimationFrame 탈 때마다) 메인 공 그리기, 아무 의미 없이 중간 위치에 호출
  if (projectiles.length > 0) {
    drawProjectiles();
  }

  // 공이 패들 위에 “붙어 있는 상태”라면 패들 바로 위에 고정하고 그리기만 함
  if (ballAttached) {
    x = paddleX + paddleWidth / 2;
    y = canvas.height - paddleHeight - imgH - ballRadius - 1;
    drawBall();
  }
  // 공이 날아가고 있는 상태라면, 원래대로 공을 그린 뒤 이동·충돌 로직 실행
  else {
    
    // 충돌
    const nextX = x + dx;
    const nextY = y + dy;
    const paddleTop = canvas.height - paddleHeight - imgH + 10;
    // 벽돌 충돌
    for (let c = 0; c < brickColumnCount; c++) {
      for (let r = 0; r < bricks[c].length; r++) {
        let b = bricks[c][r];
        const bx = c * brickWidth;
        const by = r * brickHeight;
        const bw = brickWidth;
        const bh = brickHeight;

        if (
          b.status &&
          nextX + r > bx &&           // 공의 오른쪽 경계가 벽돌 왼쪽을 넘어섰는가
          nextX - r < bx + bw &&      // 공의 왼쪽 경계가 벽돌 오른쪽을 넘지 않았는가
          nextY + r > by &&           // 공의 아래쪽 경계가 벽돌 위쪽을 넘어섰는가
          nextY - r < by + bh         // 공의 위쪽 경계가 벽돌 아래쪽을 넘지 않았는가
        ) {
          startBumpSfx();

          // 이전 위치로 충돌 방향 판정
          if (!invEnable) {
            const prevX = x - dx;
            const prevY = y - dy;

            if (prevY <= by || prevY >= by + bh) {  // 위아래에서 충돌
              dy = -dy;
            } else {    // 좌우에서 충돌
              dx = -dx;
            }
          }

          b.status = 0;
          if (b.isItem) {
            if (damageEnable) {
              score += 300;
            } else {
              score += 200;
            }
            applyItemEffect(b.itemType);
          } else {
            if (damageEnable) {
              score += 200;
            } else {
              score += 100;
            }
          }
          info.querySelector(".current-score").textContent = score;
        }
      }
    }


    if (checkBossCollision(nextX, nextY, ballRadius)) {
      if (!invEnable) {
        const bossLeft = boss.x;
        const bossRight = boss.x + boss.width;
        const bossTop = boss.y;
        const bossBottom = boss.y + boss.height;

        const prevX = x - dx;
        const prevY = y - dy;

        // 위/아래 충돌
        if (prevY + ballRadius <= bossTop) {
          dy = -Math.abs(dy);
          y = bossTop - ballRadius - 1;
        } else if (prevY - ballRadius >= bossBottom) {
          dy = Math.abs(dy);
          y = bossBottom + ballRadius + 1;
        }
        // 좌/우 충돌
        else if (prevX + ballRadius <= bossLeft) {
          dx = -Math.abs(dx);
          x = bossLeft - ballRadius - 1;
        } else if (prevX - ballRadius >= bossRight) {
          dx = Math.abs(dx);
          x = bossRight + ballRadius + 1;
        }
        // 대각선 충돌
        else {
          const bossCenterX = boss.x + boss.width / 2;
          const bossCenterY = boss.y + boss.height / 2;
          const diffX = nextX - bossCenterX;
          const diffY = nextY - bossCenterY;
          if (Math.abs(diffX) > Math.abs(diffY)) {
            dx = -dx;
            if (diffX > 0) x = boss.x + boss.width + ballRadius + 1;
            else x = boss.x - ballRadius - 1;
          } else {
            dy = -dy;
            if (diffY > 0) y = boss.y + boss.height + ballRadius + 1;
            else y = boss.y - ballRadius - 1;
          }
        }
      }
    }

    // 1) 좌우 벽 충돌
    if (nextX + ballRadius > canvas.width || nextX - ballRadius < 0) {
      dx = -dx;
    }
    // 2) 천장 충돌
    else if (nextY - ballRadius < 0) {
      dy = -dy;
    }
    // 3) 패들 충돌 (공이 위에서 내려올 때만)
    else if (dy > 0                             // ↓ 방향일 때
      && y + ballRadius <= paddleTop            // 현재는 패들 면 위에 있고
      && nextY + ballRadius >= paddleTop        // 다음 프레임에 패들 면을 넘길 때
    ) {
      // 공이 패들 위에 있을 때만 X범위 체크
      if (nextX > paddleX && nextX < paddleX + paddleWidth) {
        startShieldSfx();
        dy = -dy;
        y = paddleTop - ballRadius; // 공의 y 좌표 패들 면 바로 위로 보정 (부딪힌 후 위치 보정)
      }
    }

    // 4) 바닥 충돌 (항상 검사)
    if (nextY + ballRadius > canvas.height) {
      gameOver();
      return;
    }
  }

  // 캐릭터 이미지 그리기
  if (charImg.complete) {
    if (!isBlinking || (blinkFrame % 2 === 0)) {
      const imgX = paddleX + (paddleWidth - imgW) / 2;
      const imgY = canvas.height - imgH;
      ctx.drawImage(charImg, imgX, imgY, imgW, imgH);
    }
  }

  // 패들 그리기
  if (!isBlinking || (blinkFrame % 2 === 0)) {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight - imgH + 6, paddleWidth, paddleHeight);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
  }

  // 공 위치 업데이트 (ballAttached === false일 때만 의미가 있음)
  x += dx; y += dy;
  requestAnimationFrame(draw);

  if (damageEnable) {
    info.querySelector(".current-score").style.color = "lime";
  } else {
    info.querySelector(".current-score").style.color = "white";
  }
  if (bossProjectiles.length > 0) {
    drawBossProjectiles();
  }
  
  boss.warningShown = false;

  if (boss.active) {
    // 공격 0.5초 전: frame_atk.png 표시
    if ((left % 10 === 1) && left !== 0 && !boss.warningShown && (level === 2 || level === 3)) {
      boss.warningImage = new Image();
      boss.warningImage.src = `image/boss${level}/frame_atk.png`; // 확정적으로 boss3만 사용
      boss.warningShown = true;
    }
  
    // 공격 실행
    if ((left % 10 === 0) && left !== 0 && !boss.lastAttackTime) {
      bossAttack();
      if(level!=1){
        bossAtkSfx();
      }
      boss.lastAttackTime = true;
    }
  
    // draw 함수 내, 남은 시간이 10으로 나눠떨어질 때마다 공격
    if (left % 10 !== 0) {
      boss.lastAttackTime = false;
    }
    if (left % 10 !== 1) {
      boss.warningShown = false;
      boss.warningImage = null;
    }
  }
}


// === 보스 관련 코드 ===
// === 전역 변수 ===
let boss = {
  active: false,
  hp: 10,
  x: 100,
  y: brickHeight * 3,
  width: 0,
  height: 0,
  dx: 2,
  direction: 1,
  frameIndex: 0,
  imageFrames: [],
  frameTimer: null,
  moveTimer: null
};

function initBoss() {
  boss.active = false;
  boss.hp = 0;
  if (boss.frameTimer) clearInterval(boss.frameTimer);
  if (boss.moveTimer) clearInterval(boss.moveTimer);
}

// === 보스 프레임 로딩 ===
function loadBossFrames() {
  boss.imageFrames = [];
  let folder = "boss1";
  if (level === 2) folder = "boss2";
  if (level === 3) folder = "boss3";
  for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `image/${folder}/frame${i}.png`;
    boss.imageFrames.push(img);
  }
}

// === 보스 등장 ===
function spawnBoss() {
  console.log("보스 등장!");
  for (let c = 0; c < brickColumnCount; c++) {
    bricks[c].splice(3, 6);  // 3~6번째 줄 제거
  }

  boss.active = true;
  // 레벨별 보스 체력 및 크기 설정
  if (level === 1) {
    boss.hp = 10;
    boss.width = brickWidth * 2;
    playBgm(7);
  } else if (level === 2) {
    boss.hp = 20;
    boss.width = brickWidth * 3;
    playBgm(8);
  } else if (level === 3) {
    boss.hp = 30;
    boss.width = brickWidth * 3;
    playBgm(9);
  }

  boss.height = boss.width; // 정사각형으로 설정
  boss.x = (canvas.width - boss.width) / 2;
  boss.y = brickHeight * 3;
  boss.frameIndex = 0;

  // 애니메이션
  if (boss.frameTimer) clearInterval(boss.frameTimer);
  boss.frameTimer = setInterval(() => {
    boss.frameIndex = (boss.frameIndex + 1) % boss.imageFrames.length;
  }, 400);

  // 이동: 레벨 1만 움직임, 2·3은 정지
  if (boss.moveTimer) clearInterval(boss.moveTimer);
  let tt=false;
  if (level === 1) {
    boss.moveTimer = setInterval(() => {
      let t=step%10
      if(t==4){
        boss.direction*=-1;
        boss.x += boss.dx * boss.direction;
        if(tt==false) 
          bossAtkSfx();
        tt=true;
      }else if(t==5&&boss.y<=canvas.height-200&&tt){ //레벨1 보스 공격 추가
        boss.y+=20;
      }else if(boss.y>brickHeight*3){
        if(paddleX<(boss.x + boss.width)&&(paddleX+paddleWidth)>boss.x&&tt){
          loseLife();
        }
        tt=false;
        boss.y-=15;
      }else{
        boss.y=brickHeight*3;
      boss.x += boss.dx * boss.direction;
      if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
        boss.direction *= -1;
      }}
    }, 20);
  }
  else if (level === 2 || level === 3){
    // ─── boss2, boss3: 단순 양옆 이동만.  ───
    boss.moveTimer = setInterval(() => {
      boss.x += boss.dx * boss.direction;
      if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
        boss.direction *= -1;
      }
    }, 20);
  }
}

// === 보스 그리기 ===
function drawBoss() {
  if (!boss.active) return;

  let img;

  // 공격 예고 이미지가 설정된 경우 우선 출력
  if (boss.warningShown && boss.warningImage?.complete) {
    img = boss.warningImage;
  } else if (boss.imageFrames.length > 0) {
    img = boss.imageFrames[boss.frameIndex];
  } else {
    return; // 프레임이 없으면 그리지 않음
  }

  const size = boss.width;
  if (img.complete) {
    ctx.drawImage(img, boss.x, boss.y, size, size);
    drawBossHpBar();
  }
}

// === 체력바 그리기 ===
function drawBossHpBar() {
  const barWidth = boss.width;
  const barHeight = 10;
  let maxHp = 10;
  if (level === 2) maxHp = 20;
  if (level === 3) maxHp = 30;
  const filled = barWidth * (boss.hp / maxHp);
  ctx.fillStyle = "red";
  ctx.fillRect(boss.x, boss.y + boss.height + 5, filled, barHeight);
  ctx.strokeStyle = "white";
  ctx.strokeRect(boss.x, boss.y + boss.height + 5, barWidth, barHeight);
}
function drawBossProjectiles() {
  for (let i = bossProjectiles.length - 1; i >= 0; i--) {
    const p = bossProjectiles[i];
    p.y += p.dy;

    // 그리기
    ctx.beginPath();
    if (level === 2) {
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = "orange";  // 2단계 보스는 주황색
    }
    if (level === 3) {
      ctx.moveTo(p.x, p.y + p.radius);
      ctx.lineTo(p.x - p.radius, p.y - p.radius);
      ctx.lineTo(p.x + p.radius, p.y - p.radius);
      ctx.closePath();
      ctx.fillStyle = "#00a6d9";    // 3단계 보스는 푸른색
    }
    ctx.fill();
    ctx.closePath();

    // 패들과 충돌 판정
    const paddleTop = canvas.height - paddleHeight - imgH + 6;
    const paddleBottom = canvas.height - imgH + 6;
    const paddleLeft = paddleX;
    const paddleRight = paddleX + paddleWidth;
    if (
      p.y + p.radius > paddleTop &&
      p.y - p.radius < paddleBottom &&
      p.x + p.radius > paddleLeft &&
      p.x - p.radius < paddleRight
    ) {
      bossProjectiles.splice(i, 1);
      loseLife();
      continue;
    }

    // 바닥에 닿으면 제거
    if (p.y - p.radius > canvas.height) {
      bossProjectiles.splice(i, 1);
    }
  }
}

// === 충돌 판정 ===
let lastBossHitTime = 0;

function checkBossCollision(x, y, r) {
  if (!boss.active) return false;

  const bx = boss.x, by = boss.y, bw = boss.width, bh = boss.height;
  const hit = (
    x + r > bx && x - r < bx + bw &&
    y + r > by && y - r < by + bh
  );

  if (hit) {
    const now = Date.now();

    if (lastBossHitTime === 0 || now - lastBossHitTime >= 500) {
      lastBossHitTime = now;
      startBossHitSfx();
      if (damageEnable) {
        boss.hp -= 2;
      } else {
        boss.hp--;
      }

      if (boss.hp <= 0) {
        boss.active = false;
        clearInterval(boss.frameTimer);
        clearInterval(boss.moveTimer);
        gameClear();
      }
    }

    return true; // 충돌 자체는 항상 true 반환
  }

  return false;
}

// === 사운드 ===
function startBossHitSfx() {
  const sfx = new Audio("sound/boss_hit.mp3");
  sfx.volume = volume;
  sfx.play();
}


// === 목숨 감소 공용 함수 ===
let blinkTimer = null;
let isBlinking = false;
let blinkFrame = 0;
function loseLife() {
  const info = document.getElementById(`level${level}`);
  const lifeEl = info.querySelector(".current-life");
    startDamageSfx();
  let currentLife = parseInt(lifeEl.textContent);
  if (currentLife <= 4) {
    paddleWidth -= 40;
  }
  currentLife--;
  lifeEl.textContent = currentLife;
  if (currentLife <= 0) {
    gameOver();
  } else {
    // 깜빡임 시작
    isBlinking = true;
    blinkFrame = 0;
    if (blinkTimer) clearInterval(blinkTimer);
    blinkTimer = setInterval(() => {
      blinkFrame++;
      if (blinkFrame > 10) { // 약 2초간(10프레임) 깜빡임
        isBlinking = false;
        clearInterval(blinkTimer);
        blinkTimer = null;
      }
    }, 200); // 0.2초마다 토글
  }
}