import { Injectable } from '@nestjs/common';
import { IText } from './IText';

@Injectable()
export class AppService {
  getTranscriptAsync(recording, recorder): Promise<IText> {
    return new Promise(async (resolve, reject) => {
      // Node-Record-lpcm16
      // Imports the Google Cloud client library
      const speech = require('@google-cloud/speech');
      const encoding = 'LINEAR16';
      const sampleRateHertz = 16000;
      const languageCode = 'en-US';
      // const command_and_search = 'command_and_search';
      // const keywords = ['turn on', 'turn off', 'turn it on', 'turn it off'];

      const request = {
        config: {
          encoding: encoding,
          sampleRateHertz: sampleRateHertz,
          languageCode: languageCode,
          // model: command_and_search,
          // speech_contexts: keywords
        },
        singleUtterance: true,
        interimResults: false // If you want interim results, set this to true
      };
      let isSent = false;
      let result;
      // Creates a client
      const client = new speech.SpeechClient();
      // Create a recognize stream
      const recognizeStream = client
        .streamingRecognize(request)
        .on('error', error => {
          console.log(error);
          result = { error: error }
        })
        .on('data', data => {
          // process.stdout.write(
          if (data.results[0] && data.results[0].alternatives[0]) {
            console.log(`Transcription: ${data.results[0].alternatives[0].transcript}\n`);
            result = { text: data.results[0].alternatives[0].transcript, error: undefined, status: undefined };
            isSent = true;
            recording.stop();
            resolve(result);
          }
          else {
            console.log(`\n\nReached transcription time limit, press Ctrl+C\n`);
            result = { status: "Reached transcription time limit", text: undefined, error: undefined };
            reject(result);
          }
        });
      // Start recording and send the microphone input to the Speech API
      recording = recorder
        .record({
          sampleRateHertz: sampleRateHertz,
          threshold: 0, //silence threshold
          recordProgram: 'sox', // Try also "arecord" or "sox"
          silence: '1.2', //seconds of silence before ending
          endOnSilence: true,
          thresholdEnd: 0.5
        })
      recording.stream()
        .on('error', error => {
          console.log(error);
          result = { error };
          reject(result);
        })
        .pipe(recognizeStream)
        .on("end", function () {
          if (!isSent)
            resolve({ text: "", status: "stopped", error: undefined });
        });
    });

  }
}
