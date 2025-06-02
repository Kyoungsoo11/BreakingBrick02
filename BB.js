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
  1: 300,
  2: 350,
  3: 400
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
  gameFlag = false;

  // 보스 상태 초기화
  initBoss();

  if (level == 3) {
    document.getElementById("next-level-btn").innerHTML = "Next Level";
    document.getElementById("game-clear-main-btn").style.display = "block";
  }
  document.getElementById("game-clear").style.display = "none";
  if (level >= 3) {
    paused = false;
    changePage(6); //에필로그 실행
    playBgm(6);
  } else {
    changePage(0);
    level++;
    changePage(2);
    paused = false;
  }
}
function goIntro() {
  changePage(5);
  document.getElementById("intro-image1").classList.add("visible");
  showNextParagraph();
}
function clearToMain() {
  gameFlag = false;
  document.getElementById("game-clear").style.display = "none";
  goMain();
  playBgm(0);
  paused = false;
}
function overToMain() {
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
  if(i>6&&i<10){ //볼륨조절용
    currentBgm.volume = volume*0.5;
  }else{
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

  isGameOver = true;
  const info = document.getElementById(`level${level}`);
  const lifeEl = info.querySelector(".current-life");
  let currentLife = parseInt(lifeEl.textContent);
  if (currentLife < 4) {
    paddleWidth -= 40;
  }
  currentLife--;  // 목숨 1 깎기
  lifeEl.textContent = currentLife;
  startDamageSfx();

  if (currentLife <= 0) {
    // 게임 오버 직전에 best score 갱신
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
    x = canvas.width / 2;
    y = canvas.height - 30;
    dx = 3 + level * 1;           // 공 속도 dx
    dy = -(3 + level * 1);        // 공 속도 dy
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
  changePage(2);
}
function gameClear() { // 게임 클리어 함수. 나중에 텍스트 수정 구현
  document.getElementById("pause").style.display = "none";
  clearInterval(stopWatchId);
  paused = true;

  let scoreSum=0;
  // Clear Time 계산 & 반영
  const clearTime = step;
  document.getElementById("clear-time").textContent = clearTime+"\t· · ·  "+left+" * 10 = "+left*10;
  step = 0;

  // Life 반영
  const lifeEl = document.querySelector(
    `#level${level} .current-life`
  );
  const life = parseInt(lifeEl.textContent, 10);
  document.querySelector("#game-clear .current-life").textContent = life+"\t· · ·  "+life+" * 300 = "+life*300;

  scoreSum=left*10+life*300;
  // Current Score 반영
  document.querySelector("#game-clear .current-score").textContent = score+"\t· · ·  + "+scoreSum+" + 5000"+" = "+(scoreSum+score+5000);

  score+=scoreSum+5000;
  scoreSum=score-bestScores[level]; 
  let plusMinus=""
  // Best Score 갱신 & 반영
  if (score > bestScores[level]) {
    bestScores[level] = score;
    plusMinus="+"
  }
  document.querySelector("#game-clear .best-score").textContent = bestScores[level]+"\t· · ·  "+score+" ["+plusMinus+scoreSum+"]";

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
  damageBuff(1); 
  attack(1);
  invisiblity(1);
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
}

function timeAdd() {
  left += 10;
}

function damageBuff(i) {
  const info = document.getElementById(`level${level}`);
  const damageEl = info.querySelector(".damageBuff-status");
  availableDamage = parseInt(damageEl.textContent);
  if (i == 1) {
    availableDamage = 1;
  } else {
    availableDamage += i;
  }
  damageEl.textContent = availableDamage;
}

function attack(i) {
  const info = document.getElementById(`level${level}`);
  const attackEl = info.querySelector(".attack-status");
  availableAttack = parseInt(attackEl.textContent);
  if (i == 1) {
    availableAttack = 1;
  } else {
    availableAttack += i;
  }
  attackEl.textContent = availableAttack;
}

function invisiblity(i) {
  const info = document.getElementById(`level${level}`);
  const invEl = info.querySelector(".invisiblity-status");
  availableInv = parseInt(invEl.textContent);
  if (i == 1) {
    availableInv = 1;
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
      attackTime(10);

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
    }
  }

  if (e.key === "d" || e.key === "D") {
    if (availableInv > 0 && invCool == false) {
      invEnable = true;
      invCool = true;
      invisiblity(-1);
      invTime(15);
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
  initBoss();
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
  stopWatchId = setInterval(() => {
    if (!paused) {
      step++;

      if ((step + 10) % 15 == 0) {
        makeRandomItemBrick();
      }

      if (!boss.active) {
        if ((step + 10) % 15 == 0) {
          if (!paused) addBrickRow();
        }
      } else {
        if (brickRowCount < 3) {
          if ((step + 10) % 15 == 0) {
            if (!paused) addBrickRow();
          }
        }
      }

      // 보스 등장 조건 (레벨1이고, 아직 보스 안나왔고, 남은 시간이 150 이하)
      if (!boss.active && step >= 10) {
        console.log("보스 등장 조건 충족");
        loadBossFrames();  // 보스 이미지 프레임 로딩
        spawnBoss();
      }
    }
  }, 1000);



  // canvas
  const lv = document.getElementById("level" + level);
  canvas = lv.querySelector("canvas");
  ctx = canvas.getContext("2d");

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
  paddleX = (canvas.width - paddleWidth) / 2;
  x = canvas.width / 2; y = canvas.height - 30;
  dx = 3 + level * 1; dy = -(3 + level * 1);

  // 벽돌
  brickRowCount = initialBrickRows;
  initBricks();

  paddleWidth = 170;

  // 시작
  paused = false;
  requestAnimationFrame(draw);  // draw 함수에서 재호출

  //전갈갈
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

// 그리기 루프
function draw() {
  const info = document.getElementById(`level${level}`);
  info.querySelector(".current-score").textContent = score;

  if (paused) return;

  // 배경
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 벽돌
  ctx.fillStyle = brickColor;
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < bricks[c].length; r++) {
      const b = bricks[c][r];
      if (b.status) {
        const bx = c * brickWidth;
        const by = r * brickHeight;

        // 배경색 결정
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
    // 레벨2 보스 불기둥 패턴
    if (level === 2) {
      drawFirePattern();
      handleFirePatternHit();
    }
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
            if (invEnable == false) {
              projectiles.splice(i, 1);
            }
            b.status = 0;
            if (b.isItem) {
              if (damageEnable == true) {
                score += 300;
              } else {
                score += 200;
              }
              applyItemEffect(b.itemType);
            } else {
              if (damageEnable == true) {
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

  drawBall();
  if (projectiles.length > 0) {
    drawProjectiles();
  }

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

      if (b.status &&
        x > bx && x < bx + bw &&
        y > by && y < by + bh) {
        startBumpSfx();

        // 이전 위치로 방향 판정
        if (invEnable == false) {
          const prevX = x - dx;
          const prevY = y - dy;

          if (prevY <= by || prevY >= by + bh) {
            dy = -dy;  // 위아래에서 충돌
          } else {
            dx = -dx;  // 좌우에서 충돌
          }
        }

        b.status = 0;
        if (b.isItem) {
          if (damageEnable == true) {
            score += 300;
          } else {
            score += 200;
          }
          applyItemEffect(b.itemType);
        } else {
          if (damageEnable == true) {
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
    if (invEnable == false) {
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
    && y + ballRadius <= paddleTop      // 현재는 패들 면 위에 있고
    && nextY + ballRadius >= paddleTop  // 다음 프레임에 패들 면을 넘길 때
  ) {
    // 공이 패들 위에 있을 때만 X범위 체크
    if (nextX > paddleX && nextX < paddleX + paddleWidth) {
      startShieldSfx();
      dy = -dy;
      // 튕긴 후 위치 보정
      y = paddleTop - ballRadius;
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
  ctx.rect(paddleX, canvas.height - paddleHeight - imgH + 6, paddleWidth, paddleHeight);
  ctx.fillStyle = "white"; ctx.fill(); ctx.closePath();

  // 이동
  x += dx; y += dy;
  requestAnimationFrame(draw);

  if (damageEnable) {
    info.querySelector(".current-score").style.color = "lime";
  } else {
    info.querySelector(".current-score").style.color = "white";
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
    bricks[c].splice(3, 4);  // 3~6번째 줄 제거
  }

  boss.active = true;
  // 레벨별 보스 체력 및 크기 설정
  if (level === 1) {
    boss.hp = 10;
    boss.width = brickWidth * 2;
    playBgm(7);
  } else if (level === 2) {
    boss.hp = 20;
    boss.width = brickWidth * 4;
    playBgm(8);
  } else if (level === 3) {
    boss.hp = 30;
    boss.width = brickWidth * 4;
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
  if (level === 1) {
    boss.moveTimer = setInterval(() => {
      boss.x += boss.dx * boss.direction;
      if (boss.x <= 0 || boss.x + boss.width >= canvas.width) {
        boss.direction *= -1;
      }
    }, 20);
  }
  if (level === 2) {
    setTimeout(startFirePattern, 1000); // 보스 등장 1초 후 패턴 시작
  }
}

// === 보스 그리기 ===
function drawBoss() {
  if (!boss.active || boss.imageFrames.length === 0) return;
  const img = boss.imageFrames[boss.frameIndex];
  // 정사각형으로 출력: 높이를 너비와 동일하게
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
      if (damageEnable === true) {
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

//보스 공격
// === 전역 변수 추가 ===
let firePatternPhase = 0; // 0: idle, 1: 세줄 경고, 2: 세줄 불기둥, 3: 두줄 경고, 4: 두줄 불기둥, 5: 대기, 6: 다른 공격
let firePatternTimer = null;
let fireWarningActive = false;
let fireActive = false;
let fireLines = []; // 불기둥 위치 인덱스 배열
let fireWarningStart = 0;
let fireStart = 0;
let fireType = 0; // 1: 세줄, 2: 두줄
let fireAnimProgress = 0; // 0~1, 내려오는 애니메이션용
const warningImg = new Image();
warningImg.src = "image/boss2/warningfire.png";
const fireImg = new Image();
fireImg.src = "image/boss2/fire.png";
// === 불기둥 공격 패턴 시작 ===
function startFirePattern() {
  if (level !== 2 || !boss.active) return;
  firePatternPhase = 1;
  fireType = 1; // 세줄
  fireLines = [1, 3, 5];
  fireWarningActive = true;
  fireWarningStart = performance.now();
  fireActive = false;
  fireAnimProgress = 0;
  scheduleNextFirePhase();
}

function scheduleNextFirePhase() {
  if (firePatternTimer) clearTimeout(firePatternTimer);

  if (firePatternPhase === 1) { // 세줄 경고
    firePatternTimer = setTimeout(() => {
      firePatternPhase = 2;
      fireWarningActive = false;
      fireActive = true;
      fireStart = performance.now();
      fireAnimProgress = 0;
      scheduleNextFirePhase();
    }, 5000); // 5초 경고
  } else if (firePatternPhase === 2) { // 세줄 불기둥
    firePatternTimer = setTimeout(() => {
      firePatternPhase = 3;
      fireActive = false;
      fireType = 2;
      fireLines = [2, 4];
      fireWarningActive = true;
      fireWarningStart = performance.now();
      fireAnimProgress = 0;
      scheduleNextFirePhase();
    }, 2000); // 1초 내려옴 + 1초 유지
  } else if (firePatternPhase === 3) { // 두줄 경고
    firePatternTimer = setTimeout(() => {
      firePatternPhase = 4;
      fireWarningActive = false;
      fireActive = true;
      fireStart = performance.now();
      fireAnimProgress = 0;
      scheduleNextFirePhase();
    }, 5000);
  } else if (firePatternPhase === 4) { // 두줄 불기둥
    firePatternTimer = setTimeout(() => {
      firePatternPhase = 5;
      fireActive = false;
      fireAnimProgress = 0;
      scheduleNextFirePhase();
    }, 2000);
  } else if (firePatternPhase === 5) { // 대기 후 다른 공격
    firePatternTimer = setTimeout(() => {
      firePatternPhase = 6;
      // TODO: 다른 공격 함수 호출
      firePatternTimer = setTimeout(() => {
        // 다시 세줄 경고로 루프
        firePatternPhase = 1;
        fireType = 1;
        fireLines = [1, 3, 5];
        fireWarningActive = true;
        fireWarningStart = performance.now();
        fireAnimProgress = 0;
        scheduleNextFirePhase();
      }, 7000);
    }, 7000);
  }
}
// === draw에서 불기둥/경고 그리기 ===
function drawFirePattern() {
  if (level !== 2 || !boss.active) return;
  const now = performance.now();
  const lineCount = 6;
  const lineWidth = brickWidth / 2;
  const fireHeight = canvas.height;
  const warningSize = lineWidth;
  const warningAnim = Math.abs(Math.sin((now / 300))); // 0.3초 주기 깜빡임
  // === 패들 좌우 위치 계산 추가 ===
  const paddleLeft = paddleX;
  const paddleRight = paddleX + paddleWidth;

  for (let idx of fireLines) {
    const sectionWidth = canvas.width / lineCount;
    const x = sectionWidth * idx + sectionWidth / 2 - lineWidth / 2;
    // 패들과 불기둥 충돌 판정
    if (
      paddleRight > x &&
      paddleLeft < x + lineWidth
    ) {
      if (!fireHitCool) {
        fireHitCool = true;
        startDamageSfx();
        flashCharacter();
        loseLife();
        setTimeout(() => { fireHitCool = false; }, 1000); // 쿨타임
      }
    }
    // 경고
    if (fireWarningActive && warningImg.complete) {
      ctx.save();
      ctx.globalAlpha = 0.5 + 0.5 * warningAnim;
      ctx.drawImage(warningImg, x, 0, warningSize, warningSize);
      ctx.restore();
    }

    // 불기둥
    if (fireActive && fireImg.complete) {
      let elapsed = (now - fireStart) / 1000;
      let visibleHeight = 0;
      if (elapsed < 1) {
        visibleHeight = fireHeight * (elapsed / 1);
      } else {
        visibleHeight = fireHeight;
      }
      ctx.drawImage(fireImg, x, 0, lineWidth, visibleHeight);
    }
  }
}
// === 불기둥 피격 판정 및 피격 이펙트 ===
let fireHitCool = false;
function handleFirePatternHit() {
  if (!fireActive) return;
  // 캐릭터(패들) 위치 계산
  const paddleTop = canvas.height - paddleHeight - imgH + 6;
  const paddleBottom = canvas.height - imgH + 6;
  const paddleLeft = paddleX;
  const paddleRight = paddleX + paddleWidth;

  const lineCount = 6;
  const lineWidth = brickWidth / 2;

  for (let idx of fireLines) {
    const sectionWidth = canvas.width / lineCount;
    const x = sectionWidth * idx + sectionWidth / 2 - lineWidth / 2;
  }
}

// === 공용 피격 이펙트 ===
function flashCharacter() {
  const lv = document.getElementById("level" + level);
  const canvasElem = lv.querySelector("canvas");
  let flashCount = 0;
  function flash() {
    if (flashCount >= 6) {
      canvasElem.style.filter = "";
      return;
    }
    canvasElem.style.filter = flashCount % 2 === 0 ? "brightness(2)" : "brightness(0.5)";
    flashCount++;
    setTimeout(flash, 80);
  }
  flash();
}

// === 목숨 감소 공용 함수 ===
function loseLife() {
  const info = document.getElementById(`level${level}`);
  const lifeEl = info.querySelector(".current-life");
  let currentLife = parseInt(lifeEl.textContent);
  if (currentLife < 4) {
    paddleWidth -= 40;
  }
  currentLife--;
  lifeEl.textContent = currentLife;
  if (currentLife <= 0) {
    gameOver();
  }
}