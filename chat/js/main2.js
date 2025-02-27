let peer = null;
let connections = []; // 전역 변수로 선언하여 다른 함수에서도 접근할 수 있도록 함
let userName = "Anonymous"; // 기본 닉네임
let roomId = ""; // 방 ID

function init(roomId) {
  // Peer 클래스 생성자를 사용해 새로운 peer 객체를 생성
  peer = new Peer(roomId); // 방 이름을 PeerJS ID로 사용
  let lastPeerId = null; // 마지막으로 사용된 peer ID를 저장하기 위한 변수

  // Peer 서버에 연결되었을 때 발생하는 이벤트
  peer.on("open", function (id) {
    // Peer ID가 null인 경우, 마지막으로 저장된 Peer ID로 설정
    if (peer.id === null) {
      peer.id = lastPeerId;
    } else {
      lastPeerId = peer.id; // 현재 Peer ID를 마지막 Peer ID로 저장
    }

    // 현재 Peer ID를 HTML 요소에 표시
    $("#receiver-id").html("ID: " + peer.id);
    $("#status").html("Awaiting connection.. "); // 상태 메시지 업데이트
  });

  // 연결이 수신되었을 때 발생하는 이벤트
  peer.on("connection", function (conn) {
    // 새로운 연결이 생길 때마다 connections 배열에 추가
    connections.push(conn);

    conn.on("open", function () {
      $("#status").html("Connected to: " + conn.peer);
      ready(conn);
    });

    conn.on("close", function () {
      // 연결이 닫힐 때 connections 배열에서 제거
      connections = connections.filter((c) => c !== conn);
      $("#status").html("Connection closed. Awaiting connection..");
    });

    // conn = con2; // 현재 연결을 갱신
    // $("#status").html("Connected to: " + conn.peer); // 상태 메시지 업데이트
    // ready(); // 연결 준비 함수 호출
  });

  // Peer 서버와의 연결이 끊어졌을 때 발생하는 이벤트
  peer.on("disconnected", function () {
    $("#status").html("Connection lost. Please reconnect."); // 상태 메시지 업데이트
    peer.id = lastPeerId; // 마지막 Peer ID로 재설정
    peer._lastServerId = lastPeerId;
    peer.reconnect(); // Peer 서버에 다시 연결 시도
  });

  // Peer 객체가 닫혔을 때 발생하는 이벤트
  peer.on("close", function () {
    connections = []; // 연결 객체 초기화
    $("#status").html("connection destroyed"); // 상태 메시지 업데이트
  });

  // 오류 발생 시 이벤트
  peer.on("error", function (err) {
    alert(err); // 오류 메시지 알림
  });
}

function ready(conn) {
  // 연결된 클라이언트로부터 데이터 수신 시 이벤트
  conn.on("data", function (data) {
    addMessage(data, "left"); // 수신한 메시지를 왼쪽에 추가

    // 받은 메시지를 다른 모든 연결된 클라이언트에 브로드캐스트
    connections.forEach((c) => {
      // 자기 자신에게는 전송하지 않음
      if (c.peer !== conn.peer) {
        c.send(data);
      }
    });
  });

  // 연결이 닫혔을 때 발생하는 이벤트
  conn.on("close", function () {
    $("#status").html("Connection reset. Awaiting connection.."); // 상태 메시지 업데이트
  });
}

function addMessage(msg, side, userName, userImg) {
  var now = new Date();
  var h = now.getHours();
  var m = now.getMinutes();
  var s = now.getSeconds();

  // 시간, 분, 초가 한 자리 수일 경우 앞에 0을 추가
  if (h < 10) h = "0" + h;
  if (m < 10) m = "0" + m;
  if (s < 10) s = "0" + s;

  var msgHtml = [];
  msgHtml.push('<li class="chat-message ' + side + '">');

  if (side == "right") {
    // 오른쪽 메시지 형식
    msgHtml.push('<div class="chat-hour">' + h + ":" + m + ":" + s + "</div>");
    msgHtml.push('<div class="chat-text">' + msg + "</div>");
    msgHtml.push('<div class="chat-avatar">');
    msgHtml.push('<img src="' + userImg + '" alt="' + userName + '"/>');
    msgHtml.push('<div class="chat-name">' + userName + "</div>");
    msgHtml.push("</div>");
  } else {
    // 왼쪽 메시지 형식
    msgHtml.push('<div class="chat-avatar">');
    msgHtml.push('<img src="' + userImg + '" alt="' + userName + '"/>');
    msgHtml.push('<div class="chat-name">' + userName + "</div>");
    msgHtml.push("</div>");
    msgHtml.push('<div class="chat-text">' + msg + "</div>");
    msgHtml.push('<div class="chat-hour">' + h + ":" + m + ":" + s + "</div>");
  }

  msgHtml.push("</li>");

  // 채팅 박스에 메시지 HTML 추가
  $("#chat_box").append(msgHtml.join(""));
}

document
  .getElementById("create-room-button")
  .addEventListener("click", function () {
    var nicknameInput = document.getElementById("nickname-input");
    var roomIdInput = document.getElementById("room-id-input");

    var nickname = nicknameInput.value.trim();
    var roomId = roomIdInput.value.trim();

    if (nickname === "" || roomId === "") {
      alert("Please enter both your nickname and room name.");
      return;
    }

    // 입력된 닉네임과 방 이름을 사용
    alert("Welcome " + nickname + " to the room: " + roomId);

    // 읽기 전용으로 변경
    nicknameInput.value = nickname;
    nicknameInput.readOnly = true;

    roomIdInput.value = roomId;
    roomIdInput.readOnly = true;

    init(roomId); // 방을 생성하는 init 함수 호출

    // userName과 roomId를 전역 변수로 설정하여 다른 함수에서도 접근 가능하도록 함
    window.userName = nickname;
    window.roomId = roomId;
  });

$(document).ready(function () {
  $("#sendMessageBox").keydown(function (key) {
    // 메시지 박스에서 Enter 키가 눌렸을 때 이벤트
    if (key.keyCode == 13) {
      if (connections.length > 0) {
        var msg = $("#sendMessageBox").val(); // 메시지 입력 값 가져오기
        $("#sendMessageBox").val(""); // 메시지 입력 칸 비우기

        addMessage(
          msg,
          "right",
          window.userName, // userName을 전역 변수로 참조
          "https://www.bootdey.com/img/Content/avatar/avatar4.png"
        ); // 보낸 메시지를 오른쪽에 추가

        // 모든 연결된 클라이언트에게 메시지 전송
        connections.forEach((c) => {
          c.send(msg);
        });
      } else {
        $("#status").html("Connection is closed"); // 연결이 닫혀 있음을 알림
      }
    }
  });
});
