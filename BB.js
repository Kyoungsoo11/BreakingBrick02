//전역 변수, 상수

//
//함수
//openSettings: section#menu를 왼쪽으로 넘기고, section#setting을 오른쪽에서 여는 함수
function openSetting() {
    const menu = document.querySelector("#menu");
    const setting = document.querySelector("#setting");
    menu.style.transform = "translateX(-100%)";
    setting.style.transform = "translateX(0)";
}
//openInfo: section#menu를 왼쪽으로 넘기고, section#info을 오른쪽에서 여는 함수
function openInfo() {
    const menu = document.querySelector("#menu");
    const info = document.querySelector("#info");
    menu.style.transform = "translateX(-100%)";
    info.style.transform = "translateX(0)";
}
//goMenu: 다른 section이 열려 있는 상태에서 다시 section#menu를 여는 함수
function goMenu() {
    
}

function play() {

}