import functions from "firebase-functions";
import admin from "firebase-admin";
import wordleWords from "./words.js";

const pad = (num) => `${num < 10 ? "0" : ""}${num}`;
const getDateStr = (date = new Date()) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;

const guessResult = {
  missing: 0,
  present: 1,
  correct: 2,
};

admin.initializeApp();
const db = admin.firestore();

export const checkWord = functions.https.onRequest(
  async (request, response) => {
    const origin = request.headers.origin;
    if (["http://localhost:3000"].includes(origin)) {
      response.setHeader("Access-Control-Allow-Origin", origin);
    }

    // Here allow all the HTTP methods you want
    response.header("Access-Control-Allow-Methods", "GET");
    // Here you allow the headers for the HTTP requests to your server
    response.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );

    if (!request.query.word || request.query.word.length !== 5) {
      response.send({
        error: "INVALID_REQUEST",
      });
      return;
    }
    const today = getDateStr();
    if (!(await db.collection("state").doc(today).get()).exists) {
      await db
        .collection("state")
        .doc(today)
        .set({
          word: wordleWords[Math.floor(Math.random() * wordleWords.length)],
        });
    }
    const requestWord = request.query.word.toLowerCase();
    if (!(await db.collection("words").doc(requestWord).get()).exists) {
      response.send({
        error: "INVALID_WORD",
      });
      return;
    }
    const dailyWord = (
      await db.collection("state").doc(getDateStr(new Date())).get()
    )
      .data()
      .word.toLowerCase();
    const dailyWordLetters = new Set(dailyWord);
    response.send(
      dailyWord
        .split("")
        .map((letter, i) =>
          requestWord[i] === letter
            ? guessResult.correct
            : dailyWordLetters.has(requestWord[i])
            ? guessResult.present
            : guessResult.missing
        )
    );
  }
);