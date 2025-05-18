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
}


var index = 0; //현재 페이지의 인덱스 저장
var page=["main-menu","select-level","game","setting"]
var level= 0; //선택 난이도

//메뉴 선택에 따른 페이지 변경
function changePage(i){
	document.getElementById(page[index]).style.display = "none";
	index=i;
	document.getElementById(page[index]).style.display = "block";
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

// setting 관련
function setReset(){
}
function setApply(){
}

// 게임 시작
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