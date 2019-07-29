const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";

//init
window.onload = function (e) {
  liff.init(function (data) {
    initializeApp(data);
    alert("init");
  });
};

function initializeApp(data) {
  //check user permission
  const query_url = host + "?type=user_info&lineId=" + data.userId;
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