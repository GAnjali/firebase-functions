let functions = require('firebase-functions');
let admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original

exports.sendPush = functions.database.ref('/registeredUsers/{userId}/chat/{receiverId}').onUpdate((event, context) => {
    let afterSnapshot = event.after.toJSON();
    const keys = Object.keys(afterSnapshot);
    const newMessage = afterSnapshot[keys[keys.length - 1]];
    const id = newMessage._id;
    const sender = context.params.userId;
    const receiver = context.params.receiverId;
    if (id === 1) {
        return 0;
    }
    let dbUserProfileRef = admin.database().ref("registeredUserProfileInfo").child(receiver);
            let dbLocalContRef = dbUserProfileRef.child("LocalContacts");
            let senderName = sender;
            dbLocalContRef.once("value", (contactsFromDb) =>{
                if(contactsFromDb.hasChild(sender)){
                    senderName = contactsFromDb.child(sender).val()
                    console.log(senderName)
                }
            })

    console.log(newMessage, senderName, receiver);
    admin.database().ref('registeredUserProfileInfo').child(receiver).once("value", (snapshot) => {
        const token = snapshot.toJSON().pushToken;
        const payload = {
            notification: {
                title: senderName,
                body: newMessage.text,
            },
            data: {
                sender: senderName,
                receiver: receiver
            }
        }
        return admin.messaging().sendToDevice(token, payload);
    });
    return 0;
});

exports.sendCallNotification = functions.database.ref('/videoCallInfo/{receiver}/caller')
    .onWrite((event, context )=> {
        let caller = event.after.val();
        console.log("caller:"+caller);
        if(caller!==null && caller!==undefined){
            let receiver = context.params.receiver;
            console.log("receiver:"+receiver);

            let dbUserProfileRef = admin.database().ref("registeredUserProfileInfo").child(receiver);
            let dbLocalContRef = dbUserProfileRef.child("LocalContacts");
            let callerName = caller.toString;
            dbLocalContRef.once("value", (contactsFromDb) =>{
                if(contactsFromDb.hasChild(caller)){
                    callerName = contactsFromDb.child(caller).val()
                    console.log(callerName)
                }
            })

            admin.database().ref('registeredUserProfileInfo').child(receiver).once("value", (snapshot) => {
                const token = snapshot.val().pushToken;
                console.log(token);
                const payload = {
                    notification: {
                        title: callerName,
                        body: "Incoming video call. Tap to open",
                        sound:"incallmanager_ringtone",
                    },
                    data:{
                        sender: callerName
                    }
                };
                return admin.messaging().sendToDevice(token, payload);
            });
            return 0;
        }
    });