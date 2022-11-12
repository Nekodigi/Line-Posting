const functions = require("firebase-functions");
const firestore = require("./infrastructure/firestore/firestore");
const firebase = require("./infrastructure/firebase/firebase")
const status = require("./structure/const/status");
const posts = require("./handler/web/data/posts");

//ClientId,clientSecret,Refresh Tokenの取得方法  https://gist.github.com/neguse11/bc09d86e7acbd6442cd4
//サンプルコード　https://zenn.dev/hisho/scraps/efbcb7cd2f7b82
const gmail = require("./infrastructure/gmail/gmail");

async function admin(){
    
}
admin();

//gmail.send("uekaz@outlook.jp", "モジュール化", "送信テスト");