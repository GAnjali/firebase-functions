let functions = require('firebase-functions');
let admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);
// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original

exports.sendCallNotification = functions.database.ref('/videoCallInfo/{receiver}/caller')
    .onWrite((event, context )=> {
        let caller = event.after.val();
        console.log("caller:"+caller);
        if(caller!==null && caller!==undefined){
            let receiver = context.params.receiver;
            console.log("receiver:"+receiver);

            admin.database().ref('registeredUserProfileInfo').child(receiver).once("value", (snapshot) => {
                const token = snapshot.val().pushToken;
                console.log(token);
                const payload = {
                    notification: {
                        title: "asdfghjkl",
                        body: "you have incoming video call",
                        color:"#607D8B",
                        icon:"ic_notif",
                        sound:"default",
                    },
                    message: {
                        data: {
                            "Nick": "Mario",
                            "body": "great match!",
                            "Room": "PortugalVSDenmark"
                        }
                    },
                    // data: {
                    //     title:"App notification",
                    //     body:"You have incoming video call",
                    //     sender: caller.toString(),
                    //     receiver: receiver,
                    //     priority:"high"
                    // }
                };
                return admin.messaging().sendToDevice(token, payload);
            });
            return 0;
        }
    });