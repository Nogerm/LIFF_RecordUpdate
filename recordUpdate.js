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
      alert("init fail");

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
      //alert(JSON.stringify(response.data));

      //update value
      let div_user_name  = document.getElementById("userName");
      div_user_name.textContent = "哈囉! " + response.data.userName;

      let div_group_name  = document.getElementById("groupName");
      reportGroup = response.data.groupName;
      reportTimeStr = timeStampToString(response.data.eventTime[response.data.eventTime.length - 1]);
      div_group_name.textContent = reportGroup + ' - ' + reportTimeStr;

      let table = document.getElementById("userTable");
      response.data.groupMembers[0].forEach((name, index) => {
        let row = table.insertRow(index + HeaderRowNum);
        let cell_name  = row.insertCell(0);
        let cell_check = row.insertCell(1);
        cell_name.innerHTML = "<td>" + name + "</td>";
        cell_check.innerHTML = "<div class=\"ui checkbox\">\n <input type=\"checkbox\">\n <label>出席狀況</label>\n </div>\n </td>"; 
      });
    } else {
      alert(response.data.message);
    }
  })
  .catch(error => {
    // Error
    console.log(error);
    alert(error);
  });
}

function timeStampToString (time){
  const datetime = new Date();
  datetime.setTime(time * 1000);
  const year = datetime.getFullYear();
  const month = datetime.getMonth() + 1;
  const date = datetime.getDate();
  return year + "/" + month + "/" + date;
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
    reportData: checkResult
  };
  alert("post data 5: " + JSON.stringify(postData));
  axios.defaults.withCredentials = true;
  axios.post(hostURL, qs.stringify(postData), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    }
  })
  .then(function (response) {
    alert("server result: " + JSON.stringify(response.data));
  })
  .catch(function (error) {
    alert("post error: " + JSON.stringify(error));
  });
}
