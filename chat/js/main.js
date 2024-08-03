let peer = null; // 이 변수는 PeerJS를 통해 생성된 Peer 객체를 참조. 초기화 시에는 null로 설정, 실제 Peer 객체가 생성되면 그 객체로 값이 변경

// Peer 간의 연결을 통해 데이터를 주고받을 수 있음. 특정 Peer와의 연결을 참조.
// 초기화 시에는 null로 설정, 실제 연결이 이루어지면 그 연결 객체로 값이 변경
let conn = null;

function init() {
  peer = new Peer(); // PeerJS 객체 생성
  let lastPeerId = null;

  peer.on("open", function (id) {
    // Peer 연결이 열릴 때 호출되는 이벤트 핸들러
    if (peer.id === null) {
      peer.id = lastPeerId;
    } else {
      lastPeerId = peer.id;
    }
    $("#receiver-id").val(peer.id); // ID를 input 필드에 표시
  });

  peer.on("connection", function (con2) {
    // 다른 Peer가 연결을 시도할 때 호출되는 이벤트 핸들러
    con2.on("open", function () {
      con2.send("does not accept incoming connection"); // 연결 시도 거부 메세지 전송
    });
    setTimeout(function () {
      con2.close(); // 일정 시간이 지난 후 연결 종료
    }, 500);
  });

  peer.on("disconnected", function () {
    // Peer가 끊어졌을 때 호출되는 이벤트 핸들러
    peer.id = lastPeerId;
    peer._lastServerId = lastPeerId;
    peer.reconnect(); // 재연결 시도
  });

  peer.on("close", function () {
    // Peer 연결이 완전히 닫혔을 때 호출되는 이벤트 핸들러
    conn = null;
    $("#status").html("Connection destroyed"); // 상태 메세지 업데이트
  });

  peer.on("error", function (err) {
    // 에러가 발생했을 때 호출되는 이벤트
    alert(err);
  });
}

function join() {
  if (conn) {
    conn.close(); // 기존 연결 닫기
  }
  conn = peer.connect($("#receiver-id").val()); // 새로운 연결 생성

  conn.on("open", function () {
    // 연결이 열렸을 때 호출되는 이벤트
    $("#status").html("Connected to: " + conn.peer); // 상태 메세지 업데이트
  });

  conn.on("data", function (data) {
    // 데이터가 수신되었을 때 호출되는 이벤트 핸들러
    addMessage(data, "left");
  });

  conn.on("close", function () {
    // 연결이 닫혔을 때 호출되는 이벤트
    $("#status").html("Connection closed. Awaiting connection.."); // 상태 메세지 업데이트
  });
}

function addMessage(msg, side) {
  // 시간 가져옴
  var now = new Date();
  var h = now.getHours();
  var m = now.getMinutes();
  var s = now.getSeconds();

  // 시간 형식 맞춤(10 이하일때 0 붙힘)
  if (h < 10) h = "0" + h;
  if (m < 10) m = "0" + m;
  if (s < 10) s = "0" + s;

  var msgHtml = [];
  if (side == "right") {
    // 송신 메세지 형식
    msgHtml.push('<li class="chat-right">');
    msgHtml.push('<div class="chat-hour">' + h + ":" + m + ":" + s + " </div>");
    msgHtml.push('<div class="chat-text"> ' + msg + "</div>");
    msgHtml.push(
      '<div class="chat-avatar"><img src="https://www.bootdey.com/img/Content/avatar/avatar4.png" alt="Retail Admin"/>'
    );
    msgHtml.push('<div class="chat-name">Sam</div>');
    msgHtml.push("</div>");
    msgHtml.push("</li>");
  } else {
    // 수신 메세지 형식
    msgHtml.push('<li class="chat-left">');
    msgHtml.push('<div class="chat-avatar">');
    msgHtml.push(
      '<img src="https://www.bootdey.com/img/Content/avatar/avatar3.png" alt="Retail Admin" />'
    );
    msgHtml.push('<div class="chat-name">Russell</div>');
    msgHtml.push("</div>");
    msgHtml.push('<div class="chat-text"> ' + msg + " </div> ");
    msgHtml.push('<div class="chat-hour"> ' + h + ":" + m + ":" + s + "</div>");
    msgHtml.push("</li>");
  }

  $("#chat_box").append(msgHtml.join("")); // 메세지 추가
}

$(document).ready(function () {
  init(); // 초기화 함수 호출
  $("#connect-button").click(function () {
    join(); // 연결 함수 호출
  });

  $("#sendMessageBox").keydown(function (key) {
    // Enter키를 눌렀을 때
    if (key.keyCode == 13) {
      if (conn && conn.open) {
        var msg = $("#sendMessageBox").val(); // 입력 메세지 가져오기
        $("#sendMessageBox").val(""); // 입력 필드 초기화
        conn.send(msg); // 메세지 전송
        addMessage(msg, "right"); // 송신 메세지 추가
      } else {
        $("#status").html("Connection is closed"); // 아니면 연결이 닫혀있음을 알림
      }
    }
  });
});
