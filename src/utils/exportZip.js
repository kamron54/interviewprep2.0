import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export async function exportInterviewSession(results) {
  const zip = new JSZip();

  results.forEach((item, index) => {
    const folderName = `Q${index + 1} - ${item.question.slice(0, 50)}`;
    const folder = zip.folder(folderName);

    if (item.skipped) {
      folder.file('skipped.txt', 'This question was skipped.');
    } else {
      if (item.audioBlob) {
        folder.file('audio.webm', item.audioBlob);
      }
      if (item.videoBlob) {
        folder.file('video.webm', item.videoBlob);
      }
      if (item.transcript) {
        folder.file('transcript.txt', item.transcript);
      }
      if (item.feedback) {
        folder.file('feedback.txt', item.feedback);
      }
    }
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'interview.zip');
}
