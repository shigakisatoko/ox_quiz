//エラーになるコード
    
    var disasterTexts = {
        typhoon: {
            message: "In such a case,<br/>what would you do?",
            left: false,     
            dummy: [90, 10]
        },
        volcano: {
            message: "In such a case,<br/>what would you do?",
            left: false,
            dummy: [80, 20]
        },
        snow: {
            message: "In such a case,<br/>what would you do?",
            left: true,
            dummy: [70, 30]
        },
        earthquake: {
            message: "When a earthquake happened,<br/>what would you do?",
            left: true,
            dummy: [60, 40]
        },
        tsunami: {
            message: "After earthquake happened,<br/>what would you do?",
            left: false,
            dummy: [50, 50]
        }
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
    var count = 0; //「LEARN BY COMICS」の回数
    
 /* ********************************
  *
  * クイズダイアログ
  *
  ********************************* */
    //ダイアログ表示・非表示
    var showDialog = function (_disasterName) {
        disasterName = _disasterName; //台風のIDがそのまま入っている
        
        // ダイアログの中身を切り替える
        var disasterInfo = disasterTexts[_disasterName]; 
        $('#quiz_dialog .headline').html(_disasterName.toUpperCase());　//タイトル
        $('#quiz_dialog .message').html(disasterInfo.message);
        $('#quiz_dialog .quiz_left')
            .attr('src', './img/' + _disasterName + '_' + disasterInfo.left + '.png')
            .attr('onClick', 'showQuizResult(' + disasterInfo.left + ')');
        $('#quiz_dialog .quiz_right')
            .attr('src', './img/' + _disasterName + '_' + !disasterInfo.left + '.png')
            .attr('onClick', 'showQuizResult(' + !disasterInfo.left + ')');
            
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
            
/*            //chart.jsでグラフを描いてみる(テスト)
            //棒グラフ
            var ctx = document.getElementById("chart-canvas");
            var myBarChart = new Chart(ctx, {
              //グラフの種類
              type: 'bar',
              //データの設定
              data: {
                  //データ項目のラベル
                  labels: ["1月", "2月", "3月", "4月", "5月", "6月"],
                  //データセット
                  datasets: [{
                      //凡例
                      label: "契約数",
                      //背景色
                      backgroundColor: "rgba(75,192,192,0.4)",
                      //枠線の色
                      borderColor: "rgba(75,192,192,1)",
                      //グラフのデータ
                      data: [12, 19, 3, 5, 2, 3]
                  }]
              },
              //オプションの設定
              options: {
                  //軸の設定
                  scales: {
                      //縦軸の設定
                      yAxes: [{
            　　　　　　　　　//目盛りの設定
                          ticks: {
                              //開始値を0にする
                              beginAtZero:true,
                          }
                      }]
                  }
              }
            });
            //グラフここまで
*/            
            
        } else if (page.matches('#quiz_result_page')) {
            if(answer){
                document.querySelector('#excellent').style.display = "block";
                document.querySelector('#mistake').style.display = "none";
                judge = "excellent";
            }else{
                document.querySelector('#excellent').style.display = "none";
                document.querySelector('#mistake').style.display = "block";
                judge = "mistake";
            }
            var disasterInfo = disasterTexts[disasterName];
            $('#quiz_result_page .answer_left')
                .attr('src', './img/' + disasterName + '_' + 'answer' + '_' + disasterInfo.left +'.png')

            $('#quiz_result_page .answer_right')
                .attr('src', './img/' + disasterName + '_' + 'answer' + '_' + !disasterInfo.left +'.png')
            
                        
            //非同期通信．「正解」「不正解」どちらを選択したか．
            $.ajax({
                type:"post",
                url:"https://www2.yoslab.net/~shigaki/foreignSystemPhp/insertSelect.php",
                data: {
                   userName: userName,
                   isCorrect: answer,
                   disasterId: disasterName,
                   quizId: quizId 
                },
                dataType:"json",
                async: true,
                success:function(result){ //resultはphpファイルから受け取ったデータ
                    // console.log("succeed: ", result);
                    // collectResult = result;　//resultの中身をグローバル変数に格納
                    
                    for(i = 0; i < result.length; i++){
                        resultArray = result[i]; //返ってきた全てのデータ格納
                        // console.log("☆", resultArray); //うまくいっている
                                  
                        //連想配列の取得                        
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
                    
                    //正解率の円グラフ
                    var pie = document.getElementById("chart-pie").getContext('2d');
                    var myChart = new Chart(pie, {
                        type: 'pie',
                        data: {
                        labels: ["CORRECT", "INCORRECT"],
                        datasets: [{
                          backgroundColor: [
                            "#e74c3c",
                            "#3498db"                 
                          ],
//                        data: [seikai, machigai],
                          data: disasterInfo.dummy,
                        }]
                      }
                    });
                    //円グラフここまで
                },error : function(XMLHttpRequest, textStatus, errorThrown) {
                    console.log("XMLHttpRequest : " + XMLHttpRequest.status);
                    console.log("textStatus : " + textStatus);
                    console.log("errorThrown : " + errorThrown.message);
                }
            });
            //ajax通信ここまで 
 
        } else if (page.matches('#disaster_comic_page')) {
            titleElement.innerHTML = 'DISASTER OCCURED';
      
            $('#comic_area img')
                .attr('src', './img/' + disasterName + count + '_comic.png')
                .attr('style', 'visibility: visible;');
                //console.log('漫画番号：' + count);
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
        
             //本来はこの実装にする．
            //ユーザーネーム空じゃないときにホームページにとぶ．
            //  if(_result.length != 0){
            //      console.log("空じゃない", result);
            //      document.getElementById('navigator').pushPage('home.html', {data: {userId: 1}});
            //  }else{
            //      console.log("空", result);
            //      document.getElementById('navigator').pushPage('login.html', {data: {userId: 1}});
            //  } 
                            
     
    }  

    //Learn by comicのボタンを押したらログがとぶ．
    function send_log(){
            //誰がどの災害をタップしたか．
            $.ajax({
                type:"post",
                url:"https://www2.yoslab.net/~shigaki/foreignSystemPhp/comicTappingLog.php",
                data: {
                   userName: userName,
                   disasterId: disasterName,
                },
                dataType:"json",
                async: true,
                success:function(result){ //resultはphpファイルから受け取ったデータ
                    //resultの中身は，タップした回数
                    count = result;  
                    console.log("ボタンタップしたか" + count);
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
        console.log(answer);
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
        document.getElementById('navigator').pushPage('disaster_comic.html', {data: {title: 'Page 2'}});
        
            //非同期通信．どの漫画を選択したか．
            $.ajax({
                type:"post",
                url:"https://www2.yoslab.net/~shigaki/foreignSystemPhp/insertComicLog.php",
                data: {
                   userName: userName,
                   judge: judge, //正解したか不正解か．
                   disasterId: disasterName,
                   quizId: quizId 
                },
                dataType:"json",
                async: true,
                success:function(result){ //resultはphpファイルから受け取ったデータ
                    // console.log("succeed: ", result);
                    // collectResult = result;　//resultの中身をグローバル変数に格納
                       
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

   
 
    