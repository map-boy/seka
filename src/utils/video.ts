export const MAX_VIDEO_DURATION_SECONDS = 10 * 60;

function waitForVideoEvent(video: HTMLVideoElement, eventName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const handleEvent = () => {
      video.removeEventListener(eventName, handleEvent);
      video.removeEventListener('error', handleError);
      resolve();
    };
    const handleError = () => {
      video.removeEventListener(eventName, handleEvent);
      video.removeEventListener('error', handleError);
      reject(new Error('The video could not be read.'));
    };
    video.addEventListener(eventName, handleEvent, { once: true });
    video.addEventListener('error', handleError, { once: true });
  });
}

export async function getVideoDuration(file: File): Promise<number> {
  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.src = objectUrl;

  try {
    await waitForVideoEvent(video, 'loadedmetadata');
    return video.duration;
  } finally {
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}

export async function splitVideoFile(
  file: File,
  onProgress?: (completedParts: number, totalParts: number) => void,
): Promise<File[]> {
  const duration = await getVideoDuration(file);
  if (duration <= MAX_VIDEO_DURATION_SECONDS) return [file];
  if (typeof MediaRecorder === 'undefined') {
    throw new Error('This browser cannot divide long videos. Please choose a video shorter than 10 minutes.');
  }

  const mimeType = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ].find((type) => MediaRecorder.isTypeSupported(type));
  if (!mimeType) {
    throw new Error('This browser cannot divide long videos. Please choose a video shorter than 10 minutes.');
  }

  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;
  video.src = objectUrl;
  await waitForVideoEvent(video, 'loadedmetadata');

  const totalParts = Math.ceil(duration / MAX_VIDEO_DURATION_SECONDS);
  const parts: File[] = [];

  try {
    for (let partIndex = 0; partIndex < totalParts; partIndex += 1) {
      const start = partIndex * MAX_VIDEO_DURATION_SECONDS;
      const end = Math.min(start + MAX_VIDEO_DURATION_SECONDS, duration);
      if (start > 0) {
        video.currentTime = start;
        await waitForVideoEvent(video, 'seeked');
      }

      const stream = video.captureStream();
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      const recording = new Promise<Blob>((resolve, reject) => {
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onerror = () => reject(new Error('The video could not be divided.'));
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
      });

      recorder.start();
      await video.play();
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, Math.max(0, end - start) * 1000);
      });
      video.pause();
      recorder.stop();
      const blob = await recording;
      stream.getTracks().forEach((track) => track.stop());
      parts.push(new File([blob], `${file.name.replace(/\.[^.]+$/, '')}_part_${partIndex + 1}.webm`, {
        type: mimeType,
        lastModified: file.lastModified,
      }));
      onProgress?.(partIndex + 1, totalParts);
    }

    return parts;
  } finally {
    video.pause();
    video.removeAttribute('src');
    video.load();
    URL.revokeObjectURL(objectUrl);
  }
}
