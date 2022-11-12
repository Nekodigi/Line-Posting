  let token = ""; 


function doPost(e) {


  let replyUrl = "https://api.line.me/v2/bot/message/reply";  


  let event = JSON.parse(e.postData.contents).events[0];
  let replyToken = event.replyToken;
  let messageType = event.message.type;
  let userMessage = event.message.text;

  var userId = event.source.userId;
  var scriptProperties = PropertiesService.getScriptProperties();
  var userStatus = scriptProperties.getProperty(userId);

  let replyMessage = "投稿種別：" + messageType + "\n投稿内容：" + userMessage + "\nステータス" + userStatus;
  let messages = [{'type': 'text','text':'投稿したいときは「投稿」と話しかけてください。投稿中で最初からやり直したいときは「全てやり直す」と話しかけてください。' }];//[{'type': 'text','text':replyMessage }];//'困ったら「ヘルプ」と話しかけてください。'replyMessage }]//example
  
  if(userMessage == "ヘルプ"){
    messages = [{'type': 'text','text':'投稿したいときは「投稿」と話しかけてください。投稿中で最初からやり直したいときは「全てやり直す」と話しかけてください。' }];
  }else if(userMessage == "全てやり直す" || userMessage == "全てリセット"){
    scriptProperties.setProperty(userId, '');
    messages = [{'type': 'text','text':'投稿を中断しました。また投稿するときは「投稿」と話しかけてください。' }];
  }else{
  switch(userStatus){
    case null:
    case '':
      if(userMessage == "投稿"){
        scriptProperties.setProperty(userId, '1');
        messages = [{'type':'text','text':'早速作っていきましょう！\nタイトルを教えてください。'}];
      }
      break;
    case '1':
      scriptProperties.setProperty(userId, '2');
      scriptProperties.setProperty(userId+":title", userMessage);
      messages = [{
        "type": "template",
        "altText": "確認",
        "template": {
            "type": "confirm",
            "actions": [
                {
                    "type": "message",
                    "label": "はい",
                    "text": "はい"
                },
                {
                    "type": "message",
                    "label": "いいえ",
                    "text": "いいえ"
                }
            ],
            "text": "タイトルは「"+userMessage+"」で良いですか？"
        }
      }]
      break;
      case '2':
        if(userMessage == "はい"){
          scriptProperties.setProperty(userId, '3');
          var title = scriptProperties.getProperty(userId+":title");
          messages = [{'type':'text','text':'タイトルを「'+title+'」で確定しました！\n次に写真を送ってください。'}];
        }else if(userMessage == "いいえ"){
          scriptProperties.setProperty(userId, '1');
          messages = [{'type':'text','text':'タイトルを教えてください。'}];
        }else{
          messages = [{'type':'text','text':'タイトルを決定するかどうか「はい」か「いいえ」で答えてください。困った時は「ヘルプ」と話しかけてくださいね！'}];
        }
        break;
      case '3':
        if(event.message.type == 'image') {
          try {
            scriptProperties.setProperty(userId, '4');
            var img = getImage(event.message.id);//これはいけるっぽいが、保存先がない。
            var fileId = saveImage(img);
            var url = 'https://drive.google.com/uc?id=' + fileId;
            scriptProperties.setProperty(userId+":tempImage", fileId);
            
            messages = [{
              "type": "template",
              "altText": "確認",
              "template": {
                  "type": "buttons",
                  "actions": [
                      {
                          "type": "message",
                          "label": "はい",
                          "text": "はい"
                      },
                      {
                          "type": "message",
                          "label": "いいえ",
                          "text": "いいえ"
                      }
                  ],
                  "thumbnailImageUrl": url,//'https://line.me/static/115d5539e2d10b8da66d31ce22e6bccd/84249/favicon.png',
                  "title": "タイトルです",
                  "text": "画像はこれで良いですか？\n※プレビューは一部デバイスでは表示されません。"//文字数制限に厳重注意
              }
            }];//,{'type':'text','text':url}
          }catch(e) {
            messages = [{'type':'text','text':'エラーが発生しました。別の画像を試してください。'}];
          }
        }else{
          messages = [{'type':'text','text':'写真を送ってください。'}];
        }
        
        break;
      case '4':
        if(userMessage == "はい"){
          scriptProperties.setProperty(userId, '5');
          messages = [{'type':'text','text':'画像を確定しました！\n次に本文を入力してください。'}];
        }else if(userMessage == "いいえ"){
          scriptProperties.setProperty(userId, '3');
          try{
            var fileId = scriptProperties.getProperty(userId+":tempImage");
            var fileData = DriveApp.getFileById(fileId);
            var getData = fileData.setTrashed(true);
            messages = [{'type':'text','text':'画像を送ってください。'}];
          }catch(e){
            messages = [{'type':'text','text':'画像を送ってください'}];
          }

        }else{
          messages = [{'type':'text','text':'画像を決定するかどうか「はい」か「いいえ」で答えてください。困った時は「ヘルプ」と話しかけてくださいね！'}];
        }
        break;
      case '5':
        scriptProperties.setProperty(userId, '6');
        scriptProperties.setProperty(userId+":body", userMessage);
        messages = [{
          "type": "template",
          "altText": "確認",
          "template": {
              "type": "confirm",
              "actions": [
                  {
                      "type": "message",
                      "label": "はい",
                      "text": "はい"
                  },
                  {
                      "type": "message",
                      "label": "いいえ",
                      "text": "いいえ"
                  }
              ],
              "text": "本文は「"+userMessage+"」で良いですか？"
          }
        }]
        break;
      case '6':
        if(userMessage == "はい"){
          scriptProperties.setProperty(userId, '7');
          messages = [{'type':'text','text':'本文を確定しました！\n投稿内容をよく確認して、投稿する場合は「投稿決定」最初からやり直したいときは「全てやり直す」と話しかけてください。'}];
        }else if(userMessage == "いいえ"){
          scriptProperties.setProperty(userId, '5');
          messages = [{'type':'text','text':'本文を送ってください'}];
        }else{
          messages = [{'type':'text','text':'画像を決定するかどうか「はい」か「いいえ」で答えてください。困った時は「ヘルプ」と話しかけてくださいね！'}];
        }
        break;
      case '7':
        if(userMessage == "投稿決定"){
          scriptProperties.setProperty(userId, '');
          var dateArray = firestoreDate();
          var firestore = FirestoreApp.getFirestore(dateArray.email, dateArray.key, dateArray.projectId);
          // CloudFirestoreからデータを読み込む
          
          
          const data = {
            "title": scriptProperties.getProperty(userId+":title"),
            "body": scriptProperties.getProperty(userId+":body"),
            "imageUrl": 'https://drive.google.com/uc?id=' + scriptProperties.getProperty(userId+":tempImage"),
            "date": new Date()
          }
          // CloudFirestoreをドキュメント追加
          var docs = firestore.getDocuments("contents");//example
          var length = docs.length;
          
          var docName = Utilities.formatDate(new Date(), 'JST', 'yyMMdd')+randomChar(2);
          firestore.createDocument("contents/"+docName, data);
          
          messages = [{'type':'text','text':'投稿を確定しました！こちらのリンクからご確認ください。\nhttps://sandbox-35d1d.web.app/contents/'+docName}];
        }else{
          messages = [{'type':'text','text':'投稿内容をよく確認して、投稿する場合は「投稿決定」最初からやり直したいときは「全てやり直す」と話しかけてください。'}];
        }
        break;
  }
  }
  
  //var userStatus = "FAILED?PROP"+userId;
  let payload = {
    'replyToken': replyToken,
    'messages': messages
  };

  let options = {
    'payload' : JSON.stringify(payload),
    'myamethod'  : 'POST',
    'headers' : {"Authorization" : "Bearer " + token},
    'contentType' : 'application/json'
  };

  UrlFetchApp.fetch(replyUrl, options);
}

//https://qiita.com/777_happ/items/93508d9c44d0d8b941f7
function getImage(id) {
  var url = 'https://api-data.line.me/v2/bot/message/' + id + '/content';
  var data = UrlFetchApp.fetch(url,{
    'headers': {
      'Authorization' :  'Bearer ' + token,
    },
    'method': 'get'
  });
  //ファイル名を被らせないように
  var img = data.getBlob().getAs('image/png').setName(Number(new Date()) + '.png');
  return img;
}

var FOLDER_ID = '1w35TzFrUflytdsY0qisBi0VNfoEla3Qr';

function saveImage(blob) {
  try{
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var file = folder.createFile(blob);
    //return file.getUrl();
    return file.getId();//preview image url = 'https://drive.google.com/uc?id=' + file.getId();
  }catch(e){
    return false;
  }
}

function randomChar(m) {
    var m = m || 15; s = '', r = 'abcdefghijklmnopqrstuvwxyz0123456789';//ABCDEFGHIJKLMNOPQRSTUVWXYZ
    for (var i=0; i < m; i++) { s += r.charAt(Math.floor(Math.random()*r.length)); }
    return s;
};

function firestoreDate() {
  var dateArray = {
    'email': '',
    'key': '',
    'projectId': ''
  }
  return dateArray;
}
