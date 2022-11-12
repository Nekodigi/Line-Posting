const firestore = require("../../infrastructure/firestore/firestore");
const projectURL = require("../../infrastructure/firebase/firebase").projectURL;
const field = require("../../structure/const/field");
const status = require("../../structure/const/status");
const gmail = require("../../infrastructure/gmail/gmail");

class User{
    constructor(){
    }

    //(await) replace Constructor
    static async build(userId){
        var user = new User();
        user.userId = userId;
        var userData = (await firestore.getDocument("users", userId)).data();
        if(userData == undefined){
            user.status = undefined;
            firestore.setDocument("users", userId, {[field.status] : status.waitingAction});//use variable for dictionary initialization
        }else{
            var keys = Object.keys(userData);
            //console.log(keys);
            keys.forEach(key => {
                user[key] = userData[key];
            });
        }
        return user;
    }

    resetImageData(){
        this.setField(field.imageUrl, JSON.stringify([]));
        this.setField(field.imageName, JSON.stringify([]));
    }

    getPostData(){
        return {
            [field.status]  : status.waitingApproval,
            [field.userId]  : this[field.userId],
            [field.title]   : this[field.title],
            [field.body]    : this[field.body],
            [field.imageUrl]: this[field.imageUrl],
            [field.id]      : this[field.id],
            [field.date]    : new Date()
        }
    }

    setStatus(value){
        this[status] = value;//for instant reference
        firestore.updateField("users", this.userId, "status", value);
    }

    setField(field, value){
        this[field] = value;
        firestore.updateField("users", this.userId, field, value);
    }

    async sendMail(){
        var admins = await firestore.getDocumentsWhere("admins", "checkPost", "==", true);
        var posts = await firestore.getDocumentsWhere("preview", "status", "==", status.waitingApproval);

        if(posts.length === 0)return;
        var body = "";
        body += posts.length+"件の記事が未確認です。記事を確認するリンクを開いて、承認・却下のどちらかのリンクを開いてください。\n";

        posts.forEach((post, i) => {
            body+=`＝＝＝＝＝${i+1}件目＝＝＝＝＝\nタイトル：${post["title"]}\n`;
            body+=`記事を確認する。\n${projectURL()}/preview/${post["id"]}\n`;
            body+=`記事を承認する。\n${projectURL()}/approve/${post["id"]}\n`;
            body+=`記事を却下する。\n${projectURL()}/deny/${post["id"]}\n`;
        });
        admins.forEach(data => {
            
            gmail.send(data["email"], "新しい記事が投稿されました。ご確認ください。", body);
        })
    }

    post(){//tepmporary move to preview
        //firestore.incrementField("variable", "postPerMonth", this[field.id].substring(0, 4), 1);
        firestore.setDocument("preview", this[field.id], this.getPostData());
        this.sendMail();
    }
}

module.exports = User;