const multer = require('multer');
const express = require('express');
const {
  inspectContent,
  extractStoredMessageContent,
  contentFilterBlockResponse,
  restoreTenantContextFromReq,
} = require('@librechat/api');
const { logger } = require('@librechat/data-schemas');
const { CacheKeys, hasActivePiiFields } = require('librechat-data-provider');
const { getVoices, streamAudio, textToSpeech } = require('~/server/services/Files/Audio');
const { getLogStores } = require('~/cache');

const router = express.Router();
const upload = multer();

router.post(
  '/manual',
  upload.none(),
  restoreTenantContextFromReq,
  (req, res, next) => {
    const filters = req.config?.filters;
    if (!hasActivePiiFields(filters?.messages?.pii, ['text'])) {
      next();
      return;
    }

    const finding = inspectContent(extractStoredMessageContent({ text: req.body?.input }), {
      filters,
    });
    if (finding == null) {
      next();
      return;
    }

    res.status(400).json(contentFilterBlockResponse(finding));
  },
  async (req, res) => {
    await textToSpeech(req, res);
  },
);

router.post('/edge', async (req, res) => {
  const { input, text, voice } = req.body || {};
  const inputText = input || text;
  if (!inputText) {
    return res.status(400).send('Missing text in request body');
  }

  try {
    const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
    const selectedVoice = voice || 'es-MX-DaliaNeural';
    const tts = new MsEdgeTTS();
    await tts.setMetadata(selectedVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3 || 'audio-24khz-48kbitrate-mono-mp3');
    res.setHeader('Content-Type', 'audio/mpeg');
    const { audioStream } = tts.toStream(inputText);
    audioStream.pipe(res);
  } catch (error) {
    logger.error(`[edge-tts] Failed to generate speech: ${error}`);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate speech' });
    }
  }
});

const logDebugMessage = (req, message) =>
  logger.debug(`[streamAudio] user: ${req?.user?.id ?? 'UNDEFINED_USER'} | ${message}`);

// TODO: test caching
router.post('/', async (req, res) => {
  try {
    const audioRunsCache = getLogStores(CacheKeys.AUDIO_RUNS);
    const audioRun = await audioRunsCache.get(req.body.runId);
    logDebugMessage(req, 'start stream audio');
    if (audioRun) {
      logDebugMessage(req, 'stream audio already running');
      return res.status(401).json({ error: 'Audio stream already running' });
    }
    audioRunsCache.set(req.body.runId, true);
    await streamAudio(req, res);
    logDebugMessage(req, 'end stream audio');
    res.status(200).end();
  } catch (error) {
    logger.error(`[streamAudio] user: ${req.user.id} | Failed to stream audio: ${error}`);
    res.status(500).json({ error: 'Failed to stream audio' });
  }
});

router.get('/voices', async (req, res) => {
  await getVoices(req, res);
});

module.exports = router;
