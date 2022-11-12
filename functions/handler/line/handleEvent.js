const client = require("./const").client;
const User = require("../../structure/class/user");
const message = require("./message").message;

exports.handleEvent = async function handleEvent(event) {
  if(event.type == "unfollow")return;

  var user = await User.build(event.source.userId);

  var res = {
    type: 'text',
    text: "TEMP" //event.message.text 実際に返信の言葉を入れる箇所
  };

    switch(event.type){
      case "message":
        res = await message(event, user);
        break;
      case "follow":
        if(user.status == undefined){
          res = {type:'text', text:"初フォローありがとうございます！記事を投稿するときは「投稿」と話しかけてください"};
        }else{
          res = {type:'text', text:"お帰りなさい！記事を投稿するときは「投稿」と話しかけてください"};
        }
        break;
    }
  
    return client.replyMessage(event.replyToken, res);
  } 