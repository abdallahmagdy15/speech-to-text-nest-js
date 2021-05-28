import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { IText } from './IText';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }
  recorder = require('node-record-lpcm16');
  recording = null;

  @Get('/api/speech-to-text/')
  async SpeechToText(): Promise<IText> {
    const result = await this.appService.getTranscriptAsync(this.recording, this.recorder);
    return result;
  }

  @Post('/api/speech-to-text/')
  StopSpeechToText() {
    if (this.recording != null) {
      this.recording.stop();
      return { status: "stopped" };
    } else {
      return { status: "error stopping the record" };
    }
  }
}
