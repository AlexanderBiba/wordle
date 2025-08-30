// Import necessary modules
import functions from '@google-cloud/functions-framework';
import admin from 'firebase-admin';
import cors from 'cors';
import wordleWords from './words.js';

// --- Configuration ---

const allowedOrigins = [
    'https://alexanderbiba.github.io',
    'http://localhost:3000' // for local testing
];

const corsHandler = cors({
  origin: function (origin, callback) {
    // Allow requests with no origin, like server-to-server or REST tools
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
});

// --- Firebase Admin SDK Initialization ---
// The SDK will automatically use the service account associated with the Cloud Run service.
// Ensure your Cloud Run service has the 'Cloud Datastore User' IAM role for Firestore access.
try {
  admin.initializeApp();
  console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
  console.error("Firebase Admin SDK initialization failed:", error);
  // The function might be initialized multiple times, so we check if it's already been initialized.
  if (error.code !== 'app/duplicate-app') {
    process.exit(1);
  }
}
const db = admin.firestore();

// --- Helper Functions & Constants ---

/**
 * Pads a number with a leading zero if it's less than 10.
 * @param {number} num The number to pad.
 * @returns {string} The padded number as a string.
 */
const pad = (num) => `${num < 10 ? '0' : ''}${num}`;

/**
 * Generates a date string in YYYYMMDD format for the current UTC date.
 * @param {Date} [date=new Date()] The date to format.
 * @returns {string} The formatted date string.
 */
const getDateStr = (date = new Date()) =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;

// Enum-like object for guess results to make code more readable.
const guessResult = {
  missing: 0, // Letter is not in the word
  present: 1, // Letter is in the word but in the wrong position
  correct: 2, // Letter is in the word and in the correct position
};

// --- Cloud Function Entry Point ---
// The name 'checkWord' here must match the entry point configured in Cloud Run.
functions.http('checkWord', (req, res) => {
  // Use the cors handler to manage CORS headers
  corsHandler(req, res, async () => {
    // 1. Validate the incoming request
    const requestWord = req.query.word;
    if (!requestWord || typeof requestWord !== 'string' || requestWord.length !== 5) {
      return res.status(400).send({
        error: 'INVALID_REQUEST',
        message: 'A 5-letter word must be provided as a query parameter.',
      });
    }

    const lowerCaseWord = requestWord.toLowerCase();
    const today = getDateStr();

    try {
      // 2. Ensure today's word exists in Firestore, creating it if necessary.
      const stateDocRef = db.collection('state').doc(today);
      let stateDoc = await stateDocRef.get();

      if (!stateDoc.exists) {
        const newWord = wordleWords[Math.floor(Math.random() * wordleWords.length)];
        await stateDocRef.set({ word: newWord });
        console.log(`Set word for ${today}: ${newWord}`);
        // Re-fetch the document to have a consistent object
        stateDoc = await stateDocRef.get();
      }

      // 3. Validate that the guessed word is a valid word from our dictionary collection.
      const wordDoc = await db.collection('words').doc(lowerCaseWord).get();
      if (!wordDoc.exists) {
        return res.status(400).send({
          error: 'INVALID_WORD',
          message: 'The guessed word is not in our dictionary.',
        });
      }

      // 4. Retrieve the daily word and perform the comparison.
      const dailyWord = stateDoc.data().word.toLowerCase();
      const dailyWordLetters = new Set(dailyWord.split(''));

      // 5. Calculate the result for each letter.
      const result = dailyWord.split('').map((letter, i) => {
        if (lowerCaseWord[i] === letter) {
          return guessResult.correct;
        }
        if (dailyWordLetters.has(lowerCaseWord[i])) {
          return guessResult.present;
        }
        return guessResult.missing;
      });

      // 6. Send the successful response.
      res.status(200).send(result);

    } catch (error) {
      console.error('Error processing word check:', error);
      res.status(500).send({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
      });
    }
  });
});