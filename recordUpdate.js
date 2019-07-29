const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";

//init
window.onload = function (e) {
  liff.init(
    data => {
      // Now you can call LIFF API
      const userId = data.context.userId;
      //alert("data: " + JSON.stringify(data));
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
  const query_url = host + "?type=user_info&lineId=" + data.context.userId;
  axios.get(query_url)
  .then(function (response) {
    // Success
    if(response.data.status === 200) {
      alert(response.data);
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