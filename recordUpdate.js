const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";

var div_loading = document.getElementById("loading");
var div_content = document.getElementById("content");
var div_name    = document.getElementById("name");

//init
window.onload = function (e) {

  div_loading.style.display = "block";
  div_content.style.display = "none";

  liff.init(
    data => {
      // Now you can call LIFF API
      initializeApp(data);
    },
    err => {
      // LIFF initialization failed
      alert("init fail");
    }
  );
};

function initializeApp(data) {
  //check user permission
  const query_url = hostURL + "?type=user_info&lineId=" + data.context.userId;
  axios.get(query_url)
  .then(function (response) {
    // Success
    div_loading.style.display = "none";
    div_content.style.display = "block";

    if(response.data.status === 200) {
      alert(JSON.stringify(response.data));

      div_name.text = response.data.userName;
    } else {
      alert(response.data.message);
    }
  })
  .catch(function (error) {
    // Error
    console.log(error);
    alert(error);
  })
}