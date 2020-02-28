const hostURL = "https://script.google.com/macros/s/AKfycbyQwaNfRrnyBB4kCOvdMgUw_o6v8Z_lNUDqjNCT5Uo-dPKBvZ0/exec";
const liffID = "1653896800-lZBLPy1z";

var allMembers = [];
var allEvents = [];
var reportAtendee = [];
var suspendGroup = [];

var selectedEventId = undefined;
var selectedEventIndex = undefined;

//init
window.onload = function (e) {
  liff.init({
      liffId: liffID
    },
    data => {
      console.log('LIFF initialization ok', data)
      if (liff.isLoggedIn()) {
        console.log('LIFF is logged in')
        liff.getProfile()
          .then(profile => {
            console.log('getProfile ok displayName', profile.displayName);
            initializeApp(profile);
          })
          .catch((err) => {
            console.log('getProfile error', err);
          })
      } else {
        console.log('LIFF is not logged in');
        liff.login();
      }
    },
    err => {
      console.log('LIFF initialization failed', err);
    }
  )
};

function showSegmentLoading() {
  let time_area = document.getElementById("time-area");
  time_area.className = "ui segment loading";
  let member_area = document.getElementById("member-area");
  member_area.style.display = "none";
}

function hideSegmentLoading() {
  let time_area = document.getElementById("time-area");
  time_area.className = "ui segment";
  let member_area = document.getElementById("member-area");
  member_area.style.display = "inherit";
}

function initializeApp(profile) {
  console.log("initializeApp" + JSON.stringify(profile));

  //query data
  showSegmentLoading();
  const query_url = hostURL + "?type=report_basic&lineId=" + profile.userId;
  axios.get(query_url)
    .then(response => {
      // Success
      hideSegmentLoading();

      if (response.data.status === 200) {
        //update time container
        allEvents = response.data.eventTime;
        updateTimeContainer(allEvents.reverse());

        //update member container
        allMembers = response.data.groupMembers;
        updateMemberContainer(allMembers);

      } else if (response.data.status === 512) {
        swal.fire({
          title: '沒有權限',
          text: '請先到設定頁面，申請成為回報人員',
          type: 'error',
          onClose: () => {
            liff.closeWindow();
          }
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
      hideSegmentLoading();
      console.log(error);
      swal.fire({
        title: '錯誤',
        text: error,
        type: 'error'
      });
    });
}

function getEventId(event) {
  return event.timestring + event.type;
}

function updateTimeContainer(events) {
  const timeContainer = document.getElementById("time-container");

  selectedEventIndex = 0;
  if (selectedEventId === undefined) selectedEventId = getEventId(events[selectedEventIndex]);
  reportAtendee = JSON.parse(JSON.stringify(allEvents[selectedEventIndex].attendee));

  events.forEach((event, index) => {
    //create time button
    let btn = document.createElement("button");
    btn.innerHTML = event.timestring.substr(4, 2) + '/' + event.timestring.substr(6, 2) + '<br>' + event.type;
    btn.setAttribute("class", (selectedEventId === getEventId(event)) ? "ui primary button" : "ui primary basic button");
    btn.setAttribute("id", getEventId(event));
    btn.setAttribute("value", index);
    btn.style.marginBottom = "8px";
    btn.onclick = function (element) {
      selectedEventId = element.target.id;
      selectedEventIndex = element.target.value;
      reportAtendee = JSON.parse(JSON.stringify(allEvents[selectedEventIndex].attendee));
      console.log("selected id: " + selectedEventId + "\nindex: " + selectedEventIndex + "\nattendee: " + allEvents[selectedEventIndex].attendee);

      //redraw all time buttons
      let children = timeContainer.children;
      for (var i = 0; i < children.length; i++) {
        let button = children[i];
        button.className = (button.id === selectedEventId) ? "ui primary button" : "ui primary basic button";
      }

      //redraw all members
      updateMemberContainer(allMembers);
    }
    timeContainer.appendChild(btn);
  });
}

function updateMemberContainer(memberGroups) {
  const memberContainer = document.getElementById("member-container");
  while (memberContainer.firstChild) {
    memberContainer.removeChild(memberContainer.firstChild)
  }

  memberGroups.forEach((memberGroup, index) => {

    let segment = document.createElement("div");
    segment.setAttribute("class", "ui segment");

    //title
    let titleContainer = document.createElement("div");
    titleContainer.setAttribute("style", "display: flex;justify-content: space-between;align-items: baseline;");
    let groupTitle = document.createElement("h2");
    groupTitle.innerText = memberGroup.groupName;
    titleContainer.appendChild(groupTitle)

    //checkbox
    let checkboxContainer = document.createElement("div");
    checkboxContainer.setAttribute("class", "ui checkbox");
    let checkboxLabel = document.createElement("label");
    checkboxLabel.innerText = "暫停聚會";
    let checkboxInput = document.createElement("input");
    checkboxInput.setAttribute("type", "checkbox");
    checkboxInput.setAttribute("id", memberGroup.groupName);
    checkboxInput.onchange = function (event) {
      const groupName = event.target.id
      console.log(groupName + " " + JSON.stringify(event.target.checked));
      if (event.target.checked) {
        //suspend
        if (suspendGroup.indexOf(groupName) === -1) suspendGroup.push(groupName);
      } else {
        //normal, remove from suspend list
        const deleteIdx = suspendGroup.indexOf(groupName);
        if (deleteIdx > -1) suspendGroup.splice(deleteIdx, 1);
      }
      console.log(JSON.stringify(suspendGroup));
    }

    checkboxContainer.appendChild(checkboxInput);
    checkboxContainer.appendChild(checkboxLabel);
    titleContainer.appendChild(checkboxContainer);

    segment.appendChild(titleContainer);

    console.log(JSON.stringify(reportAtendee));

    memberGroup.groupMember.forEach((memberName, index) => {
      //create member button
      let btn = document.createElement("button");
      btn.innerHTML = memberName;
      btn.setAttribute("class", (reportAtendee.indexOf(memberName) > -1) ? "ui primary button" : "ui primary basic button");
      btn.setAttribute("id", memberName);
      btn.setAttribute("value", memberName);
      btn.style.marginBottom = "8px";
      btn.onclick = function (element) {
        if (element.target.className === "ui primary button") {
          //currently selected, to deselect
          const deleteIdx = reportAtendee.indexOf(element.target.value);
          if (deleteIdx > -1) reportAtendee.splice(deleteIdx, 1);
        } else if (element.target.className === "ui primary basic button") {
          //currently deselected, to select
          if (reportAtendee.indexOf(element.target.value) === -1) reportAtendee.push(element.target.value);
        }
        console.log(JSON.stringify(reportAtendee));

        //redraw all members
        let children = segment.children;
        for (var i = 1; i < children.length; i++) {
          let button = children[i];
          button.className = (reportAtendee.indexOf(button.value) > -1) ? "ui primary button" : "ui primary basic button";
        }
      }
      segment.appendChild(btn);
    });

    memberContainer.appendChild(segment);
  });
}

function arrayify(collection) {
  return Array.prototype.slice.call(collection);
}

function send() {

  //console.log("reportAtendee:" + JSON.stringify(reportAtendee));

  liff.getProfile()
    .then(profile => {
      //add loading to button
      const btn = document.getElementById("submitBtn");
      btn.className = "fluid ui loading button";

      const postData = {
        lineId: profile.userId,
        type: 'report_attendee',
        time: allEvents[selectedEventIndex].timestamp,
        reportType: allEvents[selectedEventIndex].type,
        attendee: JSON.stringify(reportAtendee),
        susGroup: JSON.stringify(suspendGroup)
      };
      //console.log("postData:" + JSON.stringify(postData));

      $.ajax({
        url: hostURL,
        type: "POST",
        datatype: "json",
        data: postData,
        success: function (res, status) {
          //alert("server result: " + JSON.stringify(res) + "\nstatus: " + status);
          btn.className = "fluid ui button";

          if (res.status === 500) {
            swal.fire({
              title: '錯誤',
              text: res.message,
              type: 'error'
            });
          } else if (res.status === 200) {
            swal.fire({
              title: '回報成功',
              text: '點擊確定關閉視窗',
              type: 'success',
              onClose: () => {
                //liff.closeWindow();
              }
            });
          }
        },
        error: function (xhr, ajaxOptions, thrownError) {
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