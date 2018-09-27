var disasterTexts = {
    earthquake: [
        // { //1
        //     message: "Do you know which is an earthquake?",
        //     //message: "Which indicates 'earthquake'?",
        //     left: true,
        //     dummy: [50, 50],
        // },
        // { //2
        //     message: "Which is right,<br/>after the earthquake?",
        //     left: false,
        //     dummy: [40, 60],
        // },
        // { //3
        //     message: "Where should we evacuate in the event of a disaster",
        //     //message: "Which mark should I evacuate",
        //     left: false,
        //     dummy: [10, 90],
        // },
        { //4
            message: "Should you take the stairs or elevator when evacuating the building?",
            left: true,
            dummy: [10, 90], //簡単なクイズ
        },
        // { //5
        //     message: "Are small tsunamis dangerous?",
        //     left: false,
        //     dummy: [40, 60],
        // },
        { //6
            message: "Should you use a car or walk when you evacuate?",
            left: false,
            dummy: [10, 90],　//簡単なクイズ
        },
        // { //7
        //     message: "Which is the right action you need to take when an  earthquake strikes?",
        //     left: false,
        //     dummy: [40, 60],
        // },
        // { //8
        //     message: "Should you turn off the heater or run away when an earthquake occurs?",
        //     left: false,
        //     dummy: [30, 70],
        // },
    ],
        typhoon: [
        { //1
            message: "Which is more dangerous in the case of a typhoon?",
            //message: "Which indicates 'earthquake'?",
            left: true,
            dummy: [10, 90], //正解数：不正解数　簡単なクイズ
        },
        { //2
            message: "In such a case,<br/>what would you do?",
            left: false,
            dummy: [90, 10], //難しいクイズ
        },
    ],
     snow: [
         { //1
            message: "Which is a safer way to walk in snow?",
            //message: "Which indicates 'earthquake'?",
            left: true,
            dummy: [10, 90], //簡単なクイズ
        },
        { //2
            message: "In such a case,<br/>what would you do?",
            left: false,
            dummy: [10, 90], //簡単なクイズ
        },
    ],
};

var answer = false; //ユーザがタップした方
var _result = null;
var userName = null;
var userage = null;
var password = null;
var disasterName = null; //どの災害のクイズか
var quizId = 0; //何番目の問題か．しばらくは一問目しか作れないので，0番のみを作成．
var resultArray = []; //result(userNameとか，isCorrectをDBから受け取った結果を格納)
var seikai = 0; //isCorrect「1」の数をカウント
var machigai = 0; //isCorrect「0」の数をカウント
var judge = null; //漫画読んだ人達の正解・不正解を#exellent，#mistakeで判断．
var stageId = 0; //stageは回答状況を示す段階．DBから持ってきたクイズの解答結果．stageIdが0の状態は，どのクイズにも答えていないってこと．

/* ********************************
*
* クイズダイアログ
*
********************************* */
//ダイアログ表示・非表示
var showDialog = function () {
    console.log("showDialogに入ったところ");
    // クイズの内容
    var disasterInfo = disasterTexts[disasterName][stageId-1]; //stageIdは1だけど，一番初めの配列をもってくるために1引く． 
    console.log(disasterInfo);

    if(typeof(disasterInfo) === "undefined"){
            gazouDialog();
    }
    
    var isLeftCorrect = disasterInfo.left;//エラーの原因
    $('#quiz_dialog .headline').html(disasterName.toUpperCase());　//タイトル
    $('#quiz_dialog .message').html(disasterInfo.message);
    console.log("クイズの内容");
    //クイズの左側を推したときの処理．
    $('#quiz_dialog .quiz_left')
        .off("click")
        .attr('src', './img/' + disasterName + '0' + stageId + '_' + (isLeftCorrect ? 'o' : 'x')  + '.png')
        .on('click', function () {
            showQuizResult(isLeftCorrect);
                $.ajax({
                    type:"post",
                    url:"https://www2.yoslab.net/~shigaki/foreignSystemPhp/sel_insAnswer.php",
                    data: {
                        userName: "ox_"+userName,
                        disasterId: disasterName,
                        quizId: stageId,
                        isCorrect: answer
                    },
                    dataType:"json",
                    async: true,
                    success:function(result){ //resultはphpファイルから受け取ったデータ
                        //何を返してもらう？
                        //以下は意見を仰ぐ．(右側も同様)
                        for(i = 0; i < result.length; i++){
                            resultArray = result[i]; //返ってきた全てのデータ格納
                            // console.log("☆", resultArray); //うまくいっている
                                    
                            //連想配列の取得        
                            //円グラフのデータ取得                
                            for(key in resultArray){
                                if(key === "isCorrect"){
                                    if(resultArray[key] === "1"){
                                        seikai++; //正解した個数をカウント
                                    }else if(resultArray[key] === "0"){
                                        machigai++; //間違えた個数をカウント
                                    }   
                                }
                            }                    
                        }
                    },error : function(XMLHttpRequest, textStatus, errorThrown) {
                        console.log("XMLHttpRequest : " + XMLHttpRequest.status);
                        console.log("textStatus : " + textStatus);
                        console.log("errorThrown : " + errorThrown.message);
                        gazouDialog();
                    }
                });
            //ajax通信ここまで 
        });

    //クイズ右側の処理
    $('#quiz_dialog .quiz_right')
        .off("click")
        .attr('src', './img/' + disasterName + '0' + stageId + '_' + (!isLeftCorrect ? 'o' : 'x') + '.png')
        .on('click', function () {
            showQuizResult(!isLeftCorrect);
            $.ajax({
                type:"post",
                url:"https://www2.yoslab.net/~shigaki/foreignSystemPhp/sel_insAnswer.php",
                data: {
                    userName: "ox_"+userName,
                    disasterId: disasterName,
                    quizId: stageId,
                    isCorrect: answer
                },
                dataType:"json",
                async: true,
                success:function(result){ //resultはphpファイルから受け取ったデータ
                    //何を返してもらう？
                    //以下は意見を仰ぐ．(右側も同様)

                    for(i = 0; i < result.length; i++){
                        resultArray = result[i]; //返ってきた全てのデータ格納
                        // console.log("☆", resultArray); //うまくいっている
     
                        //円グラフのデータ取得                
                        for(key in resultArray){
                            if(key === "isCorrect"){
                                if(resultArray[key] === "1"){
                                    seikai++; //正解した個数をカウント
                                }else if(resultArray[key] === "0"){
                                    machigai++; //間違えた個数をカウント
                                }   
                            }
                        }                    
                    }
                },error : function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log("XMLHttpRequest : " + XMLHttpRequest.status);
                    console.log("textStatus : " + textStatus);
                    console.log("errorThrown : " + errorThrown.message);
                    gazouDialog();
                }
            });
            //ajax通信ここまで 
        });
    document.getElementById("quiz_dialog").show();
};

var hideDialog = function () {
    document.getElementById("quiz_dialog").hide();
};

/* ********************************
*
* タブ
*
********************************* */
// ページが表示された時
document.addEventListener('show', function(event) {

    var page = event.target;
    var titleElement = document.querySelector('#toolbar-title'); 

    if (page.matches('#first-page')) {
        titleElement.innerHTML = 'Learn about Disasters';
    } else if (page.matches('#second-page')) {
        titleElement.innerHTML = '--';          
        
    } else if (page.matches('#quiz_result_page')) {
        judge = answer;
        if(answer){
            document.querySelector('#excellent').style.display = "block";
            document.querySelector('#mistake').style.display = "none";
        }else{
            document.querySelector('#excellent').style.display = "none";
            document.querySelector('#mistake').style.display = "block";
        }
        var disasterInfo = disasterTexts[disasterName][stageId - 1];
        var isLeftCorrect = disasterInfo.left;

        //画像ファイルをまとめ直す．
        $('#quiz_result_page .answer_left')
        .attr('src', './img/' + disasterName + '0' + stageId +'_' + (isLeftCorrect ? 'o' : 'x') + '_answer' + '.png')

        $('#quiz_result_page .answer_right')
        .attr('src', './img/' + disasterName + '0' + stageId + '_' + (!isLeftCorrect ? 'o' : 'x') + '_answer' +'.png')   

        //正解率の円グラフを表示する．
        //中身のデータはクイズ解答時に取得
        var pie = document.getElementById("chart-pie").getContext('2d');
        var myChart = new Chart(pie, {
            type: 'pie',
            data: {
                labels: ["CORRECT", "INCORRECT"],
                datasets: [{
                    backgroundColor: ["#e74c3c", "#3498db"],
                    data: disasterInfo.dummy, //[seikai, machigai],
                }]
            }
        });
        //円グラフここまで
    } else if (page.matches('#disaster_comic_page')) {
        //漫画を書き換え
         $('#disaster_comic_page .comic')
        .attr('src', './img/' + disasterName + '0' + stageId + '_comic' + '.png')
    }
});

/* ********************************
*
* 追加機能のメソッド
*
********************************* */ 
//国籍を選択してもらう
function editSelects(event) {
document.getElementById('choose-sel').removeAttribute('modifier');
    if (event.target.value == 'material' || event.target.value == 'underbar') {
        document.getElementById('choose-sel').setAttribute('modifier', event.target.value);
    }
}

function addOption(event) {
    const option = document.createElement('option');
    var text = document.getElementById('optionLabel').value;
    option.innerText = text;
    text = '';
    document.getElementById('dynamic-sel').appendChild(option);
}

//ユーザ名がなかったらログインできない
function toggleToast() {
    // document.querySelector('Please input "Username"').toggle();
    alert("Please input 'student ID'!");
}

//ログインしたらホーム画面に移る
function login(){
    //ユーザネームの長さを見る
    userName = document.getElementById('userName').value;
    var userName_box = [];
    userName_box = userName;
    console.log("空じゃない", userName_box);
    
//        password = document.getElementById('password').value;
    
    //実験では，ユーザ名さえ入ればそれでOK
    if(userName_box.length == 0){
    toggleToast();
    //document.getElementById('navigator').pushPage('login.html', {data: {userId: 1}});
    }else{
    document.getElementById('navigator').pushPage('home.html', {data: {userId: 1}}); 
    }
    
}  

//災害のアイコンをタップしたら誰がどの問題を回答したのか取得
function get_ansLog(_disasterName){
    disasterName  = _disasterName;
    $.ajax({
        type:"post",
        url:"https://www2.yoslab.net/~shigaki/foreignSystemPhp/selectNextQuiz.php",
        data: {
            userName: "ox_"+userName,
            disasterId: disasterName,
        },
        dataType:"json",
        async: true,
        success:function(result){ //resultはphpファイルから受け取ったデータ
            //resultの中身は，タップした回数
            //count = result;  
            console.log("もってきた災害", result);
            if (!result || result.length <= 0) {
                stageId = 1;
            } else {
                stageId = result[0]["quizId"] //連想配列の書き方result[0].quizId
                stageId++; //次の問題にするために足す
            }
            //if(stageId == 3){
            //    gazouDialog();
            //}else{
            //  showDialog();  
            //}
            console.log("showDialogの前");
            showDialog();//問題を確定してから問題を出す．(resultをとってきた後)
        },error : function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("XMLHttpRequest : " + XMLHttpRequest.status);
            console.log("textStatus : " + textStatus);
            console.log("errorThrown : " + errorThrown.message);
        }
    });
    //ajax通信ここまで 
}

/* ********************************
*
* 正解・不正解の画面を出す
*
********************************* */
//台風の正解・不正解画面を出す
function showQuizResult(_answer){
    answer = _answer;
    console.log("★★★：" + answer);
    hideDialog();
                            
    document.getElementById('navigator').pushPage('quiz_result.html', {data: {title: 'Page'}});
}

/* ********************************
*
* 漫画の出現
*
********************************* */
//漫画
function showComic(){
    
    //非同期通信．どの漫画を選択したか．
    $.ajax({
        type:"post",
        url:"https://www2.yoslab.net/~shigaki/foreignSystemPhp/insertComicLog.php",
        data: {
                userName: "ox_"+userName,
                judge: judge ? 'o': 'x', //正解したか不正解か．
                disasterId: disasterName,
                quizId:stageId
            },
        dataType:"json",
        async: true,
        success:function(result){ //resultはphpファイルから受け取ったデータ
            console.log("succeed: ", result);
            // collectResult = result;　//resultの中身をグローバル変数に格納
            document.getElementById('navigator').pushPage('disaster_comic.html', {data: {title: 'Page 2'}});
        },error : function(XMLHttpRequest, textStatus, errorThrown) {
            console.log("XMLHttpRequest : " + XMLHttpRequest.status);
            console.log("textStatus : " + textStatus);
            console.log("errorThrown : " + errorThrown.message);
        }
    });
    //ajax通信ここまで 
}

//ホーム画面に戻るボタン
function backHome(){
    document.querySelector('#navigator').resetToPage('home.html');
}

//gazou
function gazouDialog(){
     alert("THE END!");
}