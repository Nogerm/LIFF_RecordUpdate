const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";

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
      div_group_name.textContent = response.data.groupName;

      let table = document.getElementById("userTable");
      response.data.groupMembers.forEach((element, index) => {
        let row = table.insertRow(index + 2);
        let cell_name  = row.insertCell(0);
        let cell_check = row.insertCell(1);
        cell_name.innerHTML = "<td>" + element[0] + "</td>";
        cell_check.innerHTML = "<div class=\"ui checkbox\">\n <input id=\"checkbox" + index + "\" type=\"checkbox\" οnchange=\"checkboxChange(this)\">\n <label>出席狀況</label>\n </div>\n </td>"; 
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

function checkboxChange(item) {
  alert("event: " + JSON.stringify(item));
}

function send() {
  alert("Send button");
}
