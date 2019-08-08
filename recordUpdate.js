const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";
const HeaderRowNum = 2;

var reportTimeStr = "";
var reportGroup = "";

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
  const query_url = hostURL + "?type=init_pack&lineId=" + data.context.userId;
  axios.get(query_url)
  .then(response => {
    // Success

    //show/hide element
    let div_loading = document.getElementById("loading");
    div_loading.className = "ui inverted dimmer";

    if(response.data.status === 200) {
      alert(JSON.stringify(response.data));

      //update value
      let div_user_name  = document.getElementById("userName");
      div_user_name.textContent = "哈囉! " + response.data.userName;

      let div_group_name  = document.getElementById("groupName");
      reportGroup = response.data.groupName;
      const eventsNum = response.data.eventTime.length - 1;
      reportTimeStr = timeStampToString(response.data.eventTime[eventsNum][0]);
      div_group_name.textContent = reportGroup + ' - ' + reportTimeStr;

      //update select
      var selector = document.getElementById('selectDate');
      response.data.eventTime.forEach((event) => {
        var option = document.createElement('option');
        option.value = event[1].split('T')[0];
        //option.innerText = event[1].split('T')[0];
        selector.appendChild(option);
      });

      //update table
      let table = document.getElementById("userTable");
      response.data.groupMembers[0].forEach((name, index) => {
        let row = table.insertRow(index + HeaderRowNum);
        let cell_name  = row.insertCell(0);
        let cell_check = row.insertCell(1);
        cell_name.innerHTML = "<td>" + name + "</td>";
        cell_check.innerHTML = "<div class=\"ui checkbox\">\n <input type=\"checkbox\">\n <label>出席狀況</label>\n </div>\n </td>"; 
      });
    } else {
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

function timeStampToString (time){
  const datetime = new Date();
  datetime.setTime(time * 1000);
  const year = datetime.getFullYear();
  const month = datetime.getMonth() + 1;
  const date = datetime.getDate();

  if(month < 10) return year + "/0" + month + "/" + date;
  else return year + "/" + month + "/" + date;
}

function arrayify(collection) {
  return Array.prototype.slice.call(collection);
}

function send() {
  const table = document.getElementById("userTable");
  const tableBodyArray = arrayify(table.rows);
  tableBodyArray.splice(0, 2);
  var checkResult = tableBodyArray.map(function(row) {
    return row.cells[1].children[0].children[0].checked;
  });
  //alert("check result: " + JSON.stringify(checkResult));

  const postData = {
    time: reportTimeStr,
    groupName: reportGroup,
    reportData: JSON.stringify(checkResult)
  };
  //alert("post data: " + postData);

  $.ajax({
    url: hostURL,
    type: "POST",
    datatype: "json",
    data: postData,
    success: function (res, status) {
      //alert("server result: " + JSON.stringify(res) + "\nstatus: " + status);
      swal.fire({
        title: '回報成功',
        text: '點擊確定關閉視窗',
        type: 'success',
        onClose: () => {
          liff.closeWindow();
        }
      });
    },
    error: function(xhr, ajaxOptions, thrownError) {
      swal.fire({
        title: '錯誤',
        text: "post error: " + xhr.responseText + "\najaxOptions: " + ajaxOptions + "\nthrownError: " + thrownError,
        type: 'error'
      });
    }
});
}
