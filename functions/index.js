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

            let dbUserProfileRef = firebase.database().ref("registeredUserProfileInfo").child(receiver);
            let dbLocalContRef = dbUserProfileRef.child("LocalContacts");
            let receiverName = receiverNumber.toString;
            dbLocalContRef.once("value", (contactsFromDb) =>{
                if(contactsFromDb.hasChild(caller)){
                    receiverName = contactsFromDb.child(caller).val()
                }
            })

            admin.database().ref('registeredUserProfileInfo').child(receiver).once("value", (snapshot) => {
                const token = snapshot.val().pushToken;
                console.log(token);s
                const payload = {
                    notification: {
                        title: receiverName,
                        body: "Incoming video call. Tap to open",
                        sound:"Incallmanager_ringtone",
                    },
                    data:{
                        sender: caller.toString
                    }
                };
                return admin.messaging().sendToDevice(token, payload);
            });
            return 0;
        }
    });