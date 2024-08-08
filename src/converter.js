export const convertToAudio = async (input) => {
    if (!input) {
      throw new Error('No input file provided');
    }
  
    try {
      const targetAudioFormat = 'mp3'; // WAV format is used in this example
      const audioData = await convert(input, targetAudioFormat);
      return audioData;
    } catch (error) {
      console.error('Error during conversion:', error);
      throw error;
    }
  };
  
  // Core conversion logic
  const convert = async (videoFileData) => {
    const reader = new FileReader();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        try {
          const videoFileAsBuffer = reader.result;
          const decodedAudioData = await audioContext.decodeAudioData(videoFileAsBuffer);
          const duration = decodedAudioData.duration;
  
          const offlineAudioContext = new OfflineAudioContext(
            1, // Number of channels
            16000 * duration, // Length in samples
            16000 // Sample rate
          );
  
          const soundSource = offlineAudioContext.createBufferSource();
          soundSource.buffer = decodedAudioData;
          soundSource.connect(offlineAudioContext.destination);
          soundSource.start();
  
          const renderedBuffer = await offlineAudioContext.startRendering();
          const blob = await audioBufferToBlob(renderedBuffer, 'audio/mp3');
          resolve({ blob });
        } catch (error) {
          console.error('Error during audio processing:', error);
          reject(error);
        }
      };
  
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
  
      reader.readAsArrayBuffer(videoFileData);
    });
  };
  
  // Converts AudioBuffer to Blob
  const audioBufferToBlob = (audioBuffer, type) => {
    return new Promise((resolve) => {
      const numberOfChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate;
      const length = audioBuffer.length;
      const interleaved = new Float32Array(length * numberOfChannels);
  
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          interleaved[i * numberOfChannels + channel] = channelData[i];
        }
      }
  
      const dataView = encodeWAV(interleaved, numberOfChannels, sampleRate);
      const blob = new Blob([dataView], { type });
      resolve(blob);
    });
  };
  
  // Encodes audio data into WAV format
  const encodeWAV = (samples, channels, sampleRate) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
  
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // Audio format (1 = PCM)
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * 2, true);
    view.setUint16(32, channels * 2, true);
    view.setUint16(34, 16, true); // Bits per sample
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
  
    floatTo16BitPCM(view, 44, samples);
    return view;
  };
  
  // Writes a string to a DataView buffer
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // Converts float samples to 16-bit PCM format
  const floatTo16BitPCM = (output, offset, input) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  };