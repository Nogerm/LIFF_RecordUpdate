const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";
const HeaderRowNum = 2;

var reportTimeStamp = 0;
var reportGroup = "";
var allMembers = [];
var allEvents = [];
var reportAtendee = [];

//init
window.onload = function (e) {

  liff.init(
    data => {
      // Now you can call LIFF API
      initializeApp(data);
    },
    err => {
      // LIFF initialization failed
      swal.fire({
        title: '錯誤',
        text: 'LIFF視窗初始化失敗',
        type: 'error',
        onClose: () => {
          //liff.closeWindow();
        }
      });

      //show/hide element
      let div_loading = document.getElementById("loading");
      div_loading.className = "ui inverted dimmer";
    }
  );
};

function initializeApp(data) {
  //check user permission
  const query_url = hostURL + "?type=report_basic&lineId=" + data.context.userId;
  axios.get(query_url)
  .then(response => {
    // Success

    //show/hide element
    let div_loading = document.getElementById("loading");
    div_loading.className = "ui inverted dimmer";

    if(response.data.status === 200) {
      //alert(JSON.stringify(response.data));

      const defaultIdx = response.data.eventTime.length - 1;
      allMembers = response.data.groupMembers;
      allEvents = response.data.eventTime;
      createTableHead(response.data, defaultIdx);
      createTableBodyByEvent(response.data.eventTime[defaultIdx], response.data.groupMembers);

    } else if(response.data.status === 512) {
      //alert(JSON.stringify(response.data));
      swal.fire({
        title: '沒有權限',
        text: '請先到設定頁面，申請成為回報人員',
        type: 'error',
        onClose: () => {
          liff.closeWindow();
        }
      });
    } else {
      //alert(JSON.stringify(response.data));
      swal.fire({
        title: '錯誤',
        text: response.data.message,
        type: 'error'
      });
    }
  })
  .catch(error => {
    // Error
    console.log(error);
    swal.fire({
      title: '錯誤',
      text: error,
      type: 'error'
    });
  });
}

function createTableHead (data, defaultIdx) {
  let div_group_name  = document.getElementById("groupName");
  reportGroup = data.groupName;
  reportTimeStamp = data.eventTime[defaultIdx].timestamp;
  div_group_name.textContent = reportGroup + " 回報人： " + data.userName;

  //update select
  var selector = document.getElementById('selectDate');
  data.eventTime.forEach((event, index) => {
    var option = document.createElement('option');
    option.value = event.timestamp;
    option.innerText = timeStampToString(event.timestamp) + " (" + event.type + ") ";
    if(index === defaultIdx) option.selected = "selected";
    selector.appendChild(option);
  });

  //set default atendee list
  reportAtendee = JSON.parse(JSON.stringify(data.eventTime[defaultIdx].attendee));
}

function createTableBodyByEvent (event, members) {
  //update table
  let table = document.getElementById("userTable");
  members.forEach((name, index) => {
    let row = table.insertRow(index + HeaderRowNum);
    let cell = row.insertCell(0);
    let isAtendee = event.attendee.includes(name);
    if(isAtendee) {
      cell.innerHTML = "<td><input type=\"checkbox\" id=\"" + name + "\" onclick=\"handleCheckChange(this.id, this.checked)\" checked>  " + name + "  </td>"
    } else {
      cell.innerHTML = "<td><input type=\"checkbox\" id=\"" + name + "\" onclick=\"handleCheckChange(this.id, this.checked)\">  " + name + "  </td>"
    }
  });
}

function clearTableBody () {
  $("#userTable > tbody").html("");
}

function handleCheckChange(name, checked) {
  const idx = reportAtendee.indexOf(name);
  if(checked) {
    // add to list if need
    if(idx === -1) reportAtendee.push(name);
  } else {
    // remove from list if need
    if(idx > -1) reportAtendee.splice(idx, 1);
  }
}

function timeStampToString (time){
  const datetime = new Date();
  const timezone_shift = 8;
  datetime.setTime((time + (timezone_shift * 60 * 60)) * 1000);
  const year = datetime.getFullYear();
  const month = datetime.getMonth() + 1;
  const date = datetime.getDate();

  if(month < 10 && date < 10) return year + "/0" + month + "/0" + date;
  else if(month < 10 && date >= 10) return year + "/0" + month + "/" + date;
  else if(month >= 10 && date < 10) return year + "/" + month + "/0" + date;
  else return year + "/" + month + "/" + date;
}

function arrayify(collection) {
  return Array.prototype.slice.call(collection);
}

function setSelectTime(selectedObj) {
  reportTimeStamp = parseInt(selectedObj.value);
  alert("selected stamp: " + JSON.stringify(reportTimeStamp));

  const selectedEvent = allEvents.filter(event => event.timestamp === reportTimeStamp);

  alert("selectedEvent: " + JSON.stringify(selectedEvent));

  clearTableBody();
  createTableBodyByEvent(selectedEvent, allMembers);
}

function send() {
  
  liff.getProfile()
  .then(profile => {
    //add loading to button
    const btn = document.getElementById("submitBtn");
    btn.className = "fluid ui loading button";

    const postData = {
      lineId: profile.userId,
      type: 'report_attendee',
      time: reportTimeStamp,
      atendee: JSON.stringify(reportAtendee)
    };
    alert("post data: " + JSON.stringify(postData));

    $.ajax({
      url: hostURL,
      type: "POST",
      datatype: "json",
      data: postData,
      success: function (res, status) {
        //alert("server result: " + JSON.stringify(res) + "\nstatus: " + status);
        btn.className = "fluid ui button";

        if(res.status === 500) {
          swal.fire({
            title: '錯誤',
            text: res.message,
            type: 'error'
          });
        } else {
          swal.fire({
            title: '回報成功',
            text: '點擊確定關閉視窗',
            type: 'success',
            onClose: () => {
              liff.closeWindow();
            }
          });
        }
      },
      error: function(xhr, ajaxOptions, thrownError) {
        btn.className = "fluid ui button";
        swal.fire({
          title: '錯誤',
          text: "post error: " + xhr.responseText + "\najaxOptions: " + ajaxOptions + "\nthrownError: " + thrownError,
          type: 'error'
        });
      }
    });
  })
  .catch((err) => {
    console.log('error', err);
    swal.fire({
      title: '錯誤',
      text: err,
      type: 'error'
    });
  });
}
