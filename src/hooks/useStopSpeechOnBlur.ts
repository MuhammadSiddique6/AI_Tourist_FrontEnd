import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useSpeech } from "../context/SpeechContext";

/** Stops TTS when the screen loses focus (tab change, back, etc.). */
export function useStopSpeechOnBlur() {
  const { stop } = useSpeech();

  useFocusEffect(
    useCallback(() => {
      return () => {
        stop();
      };
    }, [stop]),
  );
}
