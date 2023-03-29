// const accessToken = getCookieValue('access_token');
// console.log(accessToken);





$(document).ready(function () {
  let url = window.location.href;
  let idResult = url.substring(url.lastIndexOf("/") + 1);
  getDetails(idResult);
});

let url = window.location.href;
let idResult = url.substring(url.lastIndexOf("/") + 1);
//대기
function postComment(){

  comment_details = $('#comment_details').val();

  const formData = new FormData();

  formData.append("idResult", idResult);
//  formData.append("commentTitle", commentTitle);
  formData.append("comment_details", comment_details);
  
  $.ajax({
    type: "POST",
    url: "/comment",
    dataType: "json",
    contentType: false, 
    processData: false,
    data: formData,
    }).done(function (result) {
      console.log(result);
    }).fail(function (jqXHR) {
      console.log(jqXHR);
    }).always(function () {
      console.log("실행되는지 확인");
    });
}





function getDetails(idResult) {
  fetch(`/api/details/${idResult}`).then((res) =>
    res.json().then((data) => {
      console.log(data)
      let detailResults = data["dataResponse"];
      let commentResults = data["commentResponse"];
      let commentDetails = commentResults['comment_details']
      console.log(commentDetails)
      
      commentResults.forEach((commentResult) => {
        
      commentResult = commentResult['comment_details']

      let comment_html = `<div>${commentResult}</div>`;
      $("#commentResult").append(comment_html); 

      });

      detailResults.forEach((detailResult) => {
        let addrResult = detailResult["MRKTADDR1"];
        let nameResult = detailResult["MRKTNAME"];
        let openResult = detailResult["MRKTTYPE"];
        let urlResult = detailResult["MRKTPAGE"];
        let prodResult = detailResult["MRKTITEM"];
        let storeResult = detailResult["MRKTCOUNT"];
        let restResult = detailResult["MRKTTOILET"];
        let parkResult = detailResult["MRKTPARK"];
   

       // let detailResult = detailResult['commentId']
        console.log(urlResult)
        urlResult = (urlResult === null || urlResult === undefined) ? "준비중" : urlResult;
        parkResult = (parkResult == "Y")? "있음" : "없음"
        restResult = ( restResult == "Y")? "있음" : "없음"

        console.log(nameResult);
        let name_html = `<div>${nameResult}</div>`;  
        $("#nameResult").append(name_html);    

        let addr_html = `<div>${addrResult}</div>`;  
        $("#addrResult").append(addr_html);  

        let open_html = `<div>${openResult}</div>`;  
        $("#openResult").append(open_html);  

        let url_html = `<div>${urlResult}</div>`;  
        $("#urlResult").append(url_html);  

        let prodStore_html = `<div>${prodResult} / ${storeResult}개</div>`;  
        $("#prodStore").append(prodStore_html);  

        let restPark_html = `<div>${restResult} / ${parkResult}</div>`;  
        $("#restPark").append(restPark_html);  

  
      

        // 마커를 클릭하면 장소명을 표출할 인포윈도우 입니다
        var infowindow = new kakao.maps.InfoWindow({ zIndex: 1 });

        var mapContainer = document.getElementById("map"), // 지도를 표시할 div
          mapOption = {
            center: new kakao.maps.LatLng(37.566826, 126.9786567), // 지도의 중심좌표
            level: 3, // 지도의 확대 레벨
          };

        // 지도를 생성합니다
        var map = new kakao.maps.Map(mapContainer, mapOption);

        // 장소 검색 객체를 생성합니다
        var ps = new kakao.maps.services.Places();

        // 키워드로 장소를 검색합니다
        ps.keywordSearch(addrResult, placesSearchCB); /////////////////요기

        // 키워드 검색 완료 시 호출되는 콜백함수 입니다
        function placesSearchCB(data, status, pagination) {
          if (status === kakao.maps.services.Status.OK) {
            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            var bounds = new kakao.maps.LatLngBounds();

            for (var i = 0; i < data.length; i++) {
              displayMarker(data[i]);
              bounds.extend(new kakao.maps.LatLng(data[i].y, data[i].x));
            }

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
            map.setBounds(bounds);
          }
        }

        // 지도에 마커를 표시하는 함수입니다
        function displayMarker(place) {
          // 마커를 생성하고 지도에 표시합니다
          var marker = new kakao.maps.Marker({
            map: map,
            position: new kakao.maps.LatLng(place.y, place.x),
          });

          // 마커에 클릭이벤트를 등록합니다
          kakao.maps.event.addListener(marker, "click", function () {
            // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
            infowindow.setContent(
              '<div style="padding:5px;font-size:12px;">' +
                place.place_name +
                "</div>"
            );
            infowindow.open(map, marker);
          });
        }
      });
    })
  );
}

function parseJwt (token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}