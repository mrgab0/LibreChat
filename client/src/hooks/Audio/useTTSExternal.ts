// client/src/hooks/Audio/useTTSExternal.ts
import { useRef, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { parseTextParts } from 'librechat-data-provider';
import type { TMessageContentParts } from 'librechat-data-provider';
import useTextToSpeechExternal from '~/hooks/Input/useTextToSpeechExternal';
import usePauseGlobalAudio from '~/hooks/Audio/usePauseGlobalAudio';
import useAudioRef from '~/hooks/Audio/useAudioRef';
import { logger } from '~/utils';
import store from '~/store';

type TUseTextToSpeech = {
  messageId?: string;
  content?: TMessageContentParts[] | string;
  isLast?: boolean;
  index?: number;
};

const useTTSExternal = (props?: TUseTextToSpeech) => {
  const { messageId, content, isLast = false, index = 0 } = props ?? {};

  const isMouseDownRef = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);
  const [isSpeakingState, setIsSpeaking] = useState(false);
  const { audioRef } = useAudioRef({ setIsPlaying: setIsSpeaking });

  const { pauseGlobalAudio } = usePauseGlobalAudio(index);
  const [voice, setVoice] = useRecoilState(store.voice);
  const globalIsPlaying = useRecoilValue(store.globalAudioPlayingFamily(index));

  const isSpeaking = isSpeakingState || (isLast && globalIsPlaying);
  const {
    cancelSpeech,
    generateSpeechExternal: generateSpeech,
    isLoading,
    voices,
  } = useTextToSpeechExternal({
    setIsSpeaking,
    audioRef,
    messageId,
    isLast,
    index,
  });

  useEffect(() => {
    const firstVoice = voices[0];
    if (voices.length) {
      const lastSelectedVoice = voices.find((v) => v === voice);
      if (lastSelectedVoice != null) {
        logger.log('useTextToSpeech.ts - Effect:', { voices, voice: lastSelectedVoice });
        setVoice(lastSelectedVoice.toString());
        return;
      }
      logger.log('useTextToSpeech.ts - Effect:', { voices, voice: firstVoice });
      setVoice(firstVoice.toString());
    }
  }, [setVoice, voice, voices]);

  const cleanTextForTTS = (text: string) => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    return text
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/<think>[\s\S]*/gi, '')
      .replace(/<thought>[\s\S]*?<\/thought>/gi, '')
      .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
      .trim();
  };

  const handleMouseDown = () => {
    isMouseDownRef.current = true;
    timerRef.current = window.setTimeout(() => {
      if (isMouseDownRef.current) {
        const messageContent = content ?? '';
        const parsedMessage =
          typeof messageContent === 'string' ? messageContent : parseTextParts(messageContent, { skipReasoning: true });
        generateSpeech(cleanTextForTTS(parsedMessage), false);
      }
    }, 1000);
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking === true) {
      cancelSpeech();
      pauseGlobalAudio();
    } else {
      const messageContent = content ?? '';
      const parsedMessage =
        typeof messageContent === 'string' ? messageContent : parseTextParts(messageContent, { skipReasoning: true });
      generateSpeech(cleanTextForTTS(parsedMessage), false);
    }
  };

  return {
    handleMouseDown,
    handleMouseUp,
    toggleSpeech,
    isSpeaking,
    isLoading,
    audioRef,
    voices,
  };
};

export default useTTSExternal;
