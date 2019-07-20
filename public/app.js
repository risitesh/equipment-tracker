$(document).ready(function(){
  const appConfig = new blockstack.AppConfig(['store_write', 'publish_data'])
  const userSession = new blockstack.UserSession({ appConfig: appConfig })

  $("#signin-button").click(function (event) {
    event.preventDefault()
    userSession.redirectToSignIn()
  });

  $("#signout-button").click(function (event) {
    event.preventDefault()
    userSession.signUserOut()
    window.location = window.location.origin
  });

  if (userSession.isUserSignedIn()) {
    const { profile } = userSession.loadUserData()
    showProfile(profile)
    document.getElementById('signout-button').style.display = 'block'
  } else if (userSession.isSignInPending()) {
    userSession.handlePendingSignIn().then(userData => {
      window.location = window.location.origin
    })
  }

  $("#equipment-submit").click(function(){
    var formData = $("#equipmentForm").serializeArray(),
      dataObj = {};
    $(formData).each(function (i, field) {
      dataObj[field.name] = field.value;
    });
    const { username } = userSession.loadUserData()
    dataObj['creator_username'] = username;
    addEquipment(dataObj);
  });

  function showProfile(profile) {
    let person = new blockstack.Person(profile)
    document.getElementById('heading-name').innerHTML = person.name() ? person.name() : "Nameless Person"
    if (person.avatarUrl()) {
      document.getElementById('avatar-image').setAttribute('src', person.avatarUrl())
    }
    document.getElementById('withoutLogin').style.display = 'none'
  }

  function addEquipment(dataObj) {
    const { username } = userSession.loadUserData()
    let options = {
      encrypt: false,
      user: username,
      app: window.location.origin
    }
    userSession.putFile(dataObj.serial+'.json', JSON.stringify(dataObj), options)
      .then(() => {
        alert("Added");
        window.location.href = "/equipment";
      })
  }

  function getFile(fileList, showHTML=true, fileOwner=null){
    let options = { 
      decrypt: false,
      app: window.location.origin
    }
    if (fileOwner){
      options['username'] = fileOwner
    }
    const { username } = userSession.loadUserData()
    var html_list = "";
    fileList.forEach(file => {
      userSession.getFile(file, options)
        .then((data) => {
          let storedData = JSON.parse(data);
          console.log(storedData);
          if (showHTML) {
            html_list += buildHTML(storedData, file, username);
            document.getElementById("displayEquipment").innerHTML = html_list;
          } else {
            requestEquipment(storedData);
          }
        });
    });
  }

  function requestEquipment(jsonData){
    const { username } = userSession.loadUserData()
    let message = { "requested_id": username, "time": new Date() };
    if (jsonData.logs && jsonData.logs.length > 0){
      jsonData.logs.push(message);
    }else{
      jsonData.logs = []
      jsonData.logs.push(message);
    }
    addEquipment(jsonData);
  }

  function buildHTML(storedData, fileName, username){
    let html = "<tr>";
    html += "<td>" + storedData.name + "</td> <td>" + storedData.model + "</td> <td>" + storedData.serial + "</td><td>" + storedData.brand +"</td>";
    if (storedData.creator_username == username) {
      html += "<td><button class='btn btn-danger btn-destroy-file' value=" + fileName + ">Delete</button></td>";
    } else {
      html += "<td><button class='btn btn-success' id='btn-request-equipment' value=" + fileName + ">Request Equipment</button></td></td>";
    }
    html += "</tr>";
    return html;
  }

  function deleteFile(file){
    userSession.deleteFile(file)
      .then(()=>{
        alert("Deleted");
        window.location.reload();
      })
      .catch((err) => {
        console.log(err);
      })
  }

  if (window.location.pathname == "/equipment/" || window.location.pathname == "/equipment"){
    // deleteFile('1000.json');
    var url = window.location.href;
    var parsedUrl = new URL(url);
    var blockstackID = parsedUrl.searchParams.get("blockstack_id");
    var fileNames = parsedUrl.searchParams.get("equipment_serial");
    if (blockstackID && fileNames){
      var filesArr = fileNames.split(',');
      getFile(filesArr.map(i => i + ".json"), true, blockstackID)
    }else{
      filesArr = [];
      userSession.listFiles((files) => {
        filesArr.push(files);
        return true;
      }).then((count) => {
        if(count > 0){
          getFile(filesArr);
        }
      });
    }
  }

  $("#displayEquipment").on('click', '#btn-request-equipment', function() {
    getFile([$(this).val()], false, blockstackID);
  });

  $("#displayEquipment").on('click', '.btn-destroy-file', function () {
    deleteFile($(this).val());
  })
});