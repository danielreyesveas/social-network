import firebase from "firebase/app";
import "firebase/auth";

let app;

if (!firebase.apps.length) {
	app = firebase.initializeApp({
		apiKey: "AIzaSyCRCHS0TPhFYlTWxcE4xoPuVGa5uc7L5Ks",
		authDomain: "clics-reciclatusanimales.firebaseapp.com",
		projectId: "clics-reciclatusanimales",
		storageBucket: "clics-reciclatusanimales.appspot.com",
		messagingSenderId: "108227936926",
		appId: "1:108227936926:web:4a3b14cc59ca7fd158718f",
	});
} else {
	app = firebase.app();
}

export const googleAuthProvider = new firebase.auth.GoogleAuthProvider();

export default app;
