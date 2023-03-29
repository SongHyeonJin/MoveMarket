function getList() {
  let searchValue = $("#search").val();

  let formData = new FormData();
  formData.append("search_value", searchValue);

  fetch(`/search`, { method: "POST", body: formData })
    .then((res) => res.json())
    .then((data) => {
      let searchResults = data["dataResponse"];
      let totalPages = data["total_pages"];
      
      searchResults.forEach((searchResult) => {
        let idResult = searchResult["_id"];
        let addrResult = searchResult["주소(도로명)"];
      
        let temp_html = `<div> <a href="http://localhost:5000/details/${idResult}">${addrResult}</a></div>`;
        $("#getLists").append(temp_html);
        console.log(addrResult);
      });
    });
}


function userLogin() {
    
  loginEmail = $("#loginEmail").val();
  loginPassword = $("#loginPassword").val();


  const formData = new FormData();
  formData.append("loginEmail",loginEmail);
  formData.append("loginPassword",loginPassword);

  

  $.ajax({
    type: "POST",
    url: "/login",
    dataType: "json",
    contentType: false, 
    processData: false,
    data: formData,

    }).done(function (result) {
      
      console.log(result);
      
      const accessToken = result['access_token']
      const expireDate = new Date();
      expireDate.setDate(expireDate.getDate() + 7);
      const cookieString = `access_token=${accessToken}; expires=${expireDate.toUTCString()}; path=/`;
      document.cookie = cookieString;
           
    }).fail(function (jqXHR) {
      console.log(jqXHR);
      $("#errorMsg").show();
    }).always(function () {
      console.log("실행되는지 확인");
    });
}

function register() {

if ($("#userEmail").val() == "") {
    alert("이메일을 입력하세요.");
    $("#userEmail").focus();
    return false;
}
if ($("#userId").val() == "") {
    alert("아이디를 입력하세요.");
    $("#userId").focus();
    return false;
}
if ($("#userPwd").val() == "") {
    alert("비밀번호를 입력하세요.");
    $("#userPwd").focus();
    return false;
}
if ($("#userPwd").val() != $('#userPwdCheck').val()) {
    alert("비밀번호가 일치하지 않습니다.");
    $("#userPwdCheck").focus();
    return false;
}

  //inputs
  userEmail = $("#userEmail").val();
  userId = $("#userId").val();
  userPwd = $("#userPwd").val();
  userAddr = $("#userAddr").val();
  //userProfile = $("#userProfile").val();
  const fileInput = document.getElementById('userProfile')
  level = 1;

  const file =fileInput.files[0];
  console.log(file)
  const formData = new FormData();
  formData.append('file',file);
  
  formData.append("userEmail",userEmail);
  formData.append("userId",userId);
  formData.append("userPwd",userPwd);
  formData.append("userAddr",userAddr);
  //formData.append("userProfile",userProfile);
  formData.append("userLevel", level);


  $.ajax({
    type: "POST",
    url: "/register",
    dataType: "json",
    contentType: false, 
    processData: false,
    data: formData,

    }).done(function (result) {
        console.log(result);
    }).fail(function (jqXHR) {
        console.log(jqXHR);
        $("#errorMsg").show();
    }).always(function () {
        console.log("실행되는지 확인");
      });
 
}