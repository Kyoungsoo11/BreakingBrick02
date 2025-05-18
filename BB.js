window.onload = pageLoad;

function pageLoad(){
	document.getElementById("play-btn").onclick=goStart;
	document.getElementById("back-btn").onclick=goMain;
	document.getElementById("setting-btn").onclick=goSetting;
	document.getElementById("quit-btn").onclick=goQuit;
	document.getElementById("lv1-btn").onclick=goLv1;
	document.getElementById("lv2-btn").onclick=goLv2;
	document.getElementById("lv3-btn").onclick=goLv3;
	document.getElementById("reset-btn").onclick=setReset;
	document.getElementById("apply-btn").onclick=setApply;
	document.getElementById("back-btn2").onclick=goMain;
	document.getElementById("restart-btn").onclick=restart;
    const buttons = document.querySelectorAll(".game-main-btn");
    buttons.forEach(button => {
        button.onclick = gameToMain;
    });
}


var index = 0; //현재 페이지의 인덱스 저장
var page=["main-menu","select-level","game","setting","game-over"]
var level= 0; //선택 난이도

//메뉴 선택에 따른 페이지 변경
function changePage(i){
    if(index==2){
        document.getElementById("level"+level).style.display="none";
    }
	document.getElementById(page[index]).style.display = "none";
	index=i;
	document.getElementById(page[index]).style.display = "block";
    if(i==2){ //난이도 선택 완료 후 게임 시작 시 아래 코드 실행
        document.getElementById("level"+level).style.display="block";
        gameStart();
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
  } else return;
}

// setting 관련
function setReset(){
}
function setApply(){
}

//게임 오버
function gameOver(){
    changePage(4);
}
function restart(){
    changePage(2);
}

// 게임 시작 (여기부터 게임 구현), 참고: level= 1,2,3 난이도 저장되어있음.
function gameStart(){
}