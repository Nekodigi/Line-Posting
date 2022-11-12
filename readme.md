# Line Posting
## Require
### Setup firebase
https://yoheiko.com/blog/post-769/
```
npm install firebase
npm install -g firebase-tools
firebase login
firebase init hosting
firebase init functions (preserve firebase.json)
```
### Install following module
```
npm install
```
sharp
date-and-time  
@line/bot-sdk  
express  
ejs  
nodemailer
### Provide constant in functions/secret
line config
firebase admin sdk config  
firebase config (projectID)
gmail config(oauth) https://gist.github.com/neguse11/bc09d86e7acbd6442cd4
### Provide constant in Firestore
create collection like this.
`admins>username`
#### fields
checkPost(boolean)
email(string)
email will be sent if email is valid and checkPost==true
### Test and Deploy
run in local
```
firebase serve
```
deploy
```
firebase deploy
```
