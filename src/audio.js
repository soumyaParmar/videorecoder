// import React from "react";
// import A_Button from "../../../Atoms/Inputs/Buttons/A_Button";
// import { CloudUpload } from "@material-ui/icons";
// import CircularDeterminate from "../../../Atoms/Inputs/CircularProgressBar/CircularProgressBar";
// import { useParams } from "react-router";
// import { httpPost } from "../../../../../Utils/apis/apis";
// import { BlobServiceClient } from "@azure/storage-blob";
// import { epochToDateFormatHelper } from "../../../../../Utils/Helpers/dateUtils";
// import O_HistoricalDocumentUpload from "../HistoricalDocumentUpload/O_HistoricalDocumentUpload";
// import { responseDataSet } from "../../../../../Utils/config/config";

// export default function M_MediaUpload  (props)  {
//   const inputFile = React.useRef(null);

//   // All States
//   const [audio, setAudio] = React.useState();
//   const [uploading, setUploading] = React.useState(false);
//   const [statusHistory, setHistory] = React.useState([]);
//   const [hover, setHover] = React.useState(false);
//   const [contentDetails, setContentDetails] = React.useState();
//   const [responseStatus, setResponseStatus] = React.useState({});
//   const [handleChange, setHandleChange] = React.useState(false);
//   const { pageUrl, crmId, templateId } = useParams();

//   const { content } = props;
//   // Methods used to log details
//   const addHistory = (historyLog, addToStatus = false) => {
//     console.log("Process Logs:", historyLog);
//     if (addToStatus) {
//       addStatus(historyLog);
//     }
//   };
//   const addStatus = (historyLog) => {
//     let date = new Date().toString();
//     setHistory((oldArray) => [...oldArray, { historyLog, at: date }]);
//   };
//   const captureResponse = (message, type) => {
//     setResponseStatus({ message, type });
//   };

//   // Main Wrapper function to convert video file
//   const convertToAudio = async (input) => {
//     let start = new Date();
//     setUploading(true);
//     setHistory([]);
//     setAudio(null);

//     if (input?.target?.files?.[0]) {
//       let sourceVideoFile = input.target.files[0];
//       let ext = sourceVideoFile.name.split(".").pop();
//       if (ext.toLowerCase() === "mp3") {
//         let tempFileDetails = {
//           name: sourceVideoFile.name.substring(
//             0,
//             sourceVideoFile.name.lastIndexOf(".")
//           ),
//           format: ext,

//           blob: sourceVideoFile,
//         };
//         setAudio(tempFileDetails);
//         await uploadFileProcessed(tempFileDetails);
//       } else {
//         let targetAudioFormat = "mp3";
//         try {
//           addHistory("Conversion Started", true);
//           let convertedAudioDataObj = await convert(
//             sourceVideoFile,
//             targetAudioFormat
//           );
//           addHistory("Conversion Finished, Audio File is Ready", true);
//           setAudio(convertedAudioDataObj);
//           await uploadFileProcessed(convertedAudioDataObj);
//         } catch (error) {
//           setAudio(null);
//           addHistory("Error in processing: " + error, true);
//           captureResponse(
//             "Processing is failed please. Try again later.",
//             "FAILURE"
//           );
//         }
//       }
//       addHistory(
//         `Time Taken by Process: ${parseInt((new Date() - start) / 1000)} Sec`,
//         true
//       );

//       setHandleChange(!handleChange);
//     } else {
//       captureResponse("File not selected properly", "FAILURE");
//     }

//     setUploading(false);
//     inputFile.current.value = null;
//   };

//   // Convert video file to audio file
//   const convert = (videoFileData, targetAudioFormat) => {
//     try {
//       targetAudioFormat = targetAudioFormat.toLowerCase();
//       let reader = new FileReader();
//       let val = new Promise((resolve) => {
//         try {
//           reader.onload = async function () {
//             let audioContext = new (window.AudioContext ||
//               window.webkitAudioContext)();
//             let myBuffer;
//             const sampleRate = 16000;
//             const numberOfChannels = 1;
//             let videoFileAsBuffer = reader.result;
//             addHistory("Decoding Started");
//             let decodedAudioData = await audioContext.decodeAudioData(
//               videoFileAsBuffer
//             );
//             addHistory("Decoding Done");
//             let duration = decodedAudioData.duration;
//             let offlineAudioContext = new OfflineAudioContext(
//               numberOfChannels,
//               sampleRate * duration,
//               sampleRate
//             );
//             addHistory("Try to connect resource");
//             let soundSource = offlineAudioContext.createBufferSource();
//             myBuffer = decodedAudioData;
//             soundSource.buffer = myBuffer;
//             soundSource.connect(offlineAudioContext.destination);
//             soundSource.start();
//             addHistory("Resource connection stablish");
//             try {
//               addHistory("Rendering Started");
//               let renderedBuffer = await offlineAudioContext.startRendering();
//               addHistory("Rendering Finished and Conversion started");
//               let blob = await audioBufferToBlob(renderedBuffer);
//               let blobUrl = URL.createObjectURL(blob);

//               let convertedAudio = {
//                 name: videoFileData.name.substring(
//                   0,
//                   videoFileData.name.lastIndexOf(".")
//                 ),
//                 format: targetAudioFormat,
//                 data: blobUrl,
//                 blob,
//               };
//               addHistory("Conversion is Ready");
//               resolve(convertedAudio);
//             } catch (error) {
//               addHistory(`Error in Conversion ${error}`);
//             }
//           };
//           reader.readAsArrayBuffer(videoFileData);
//         } catch (error) {
//           addHistory(`Error in Conversion ${error}`);
//           captureResponse(
//             "Processing is failed please. Try again later.",
//             "FAILURE"
//           );
//         }
//       });
//       return val;
//     } catch (error) {
//       captureResponse(
//         "Processing is failed please. Try again later.",
//         "FAILURE"
//       );
//       addHistory(`Error in Conversion ${error}`);
//     }
//   };

//   // Convert Audio Buffer to Blob
//   const audioBufferToBlob = (audioBuffer, type) => {
//     return new Promise((resolve) => {
//       addHistory("Buffer to Blob Conversion started");
//       const numberOfChannels = audioBuffer.numberOfChannels;
//       const sampleRate = audioBuffer.sampleRate;
//       const length = audioBuffer.length;
//       const interleaved = new Float32Array(length * numberOfChannels);
//       for (let channel = 0; channel < numberOfChannels; channel++) {
//         const channelData = audioBuffer.getChannelData(channel);
//         for (let i = 0; i < length; i++) {
//           interleaved[i * numberOfChannels + channel] = channelData[i];
//         }
//       }
//       const dataView = encodeWAV(interleaved, numberOfChannels, sampleRate);
//       const blob = new Blob([dataView], { type: type });

//       addHistory("Buffer to Blob Conversion Finished");
//       return resolve(blob);
//     });
//   };

//   // This Function is required for future usage
//   const blobToBase64 = (blob) => {
//     return new Promise((resolve, _) => {
//       const reader = new FileReader();
//       reader.onload = (e) => resolve(e.target.result);
//       reader.readAsDataURL(blob);
//     });
//   };

//   // Encode Buffer into WAV
//   const encodeWAV = (samples, channels, sampleRate) => {
//     const buffer = new ArrayBuffer(44 + samples.length * 2);
//     const view = new DataView(buffer);
//     writeString(view, 0, "RIFF");
//     view.setUint32(4, 36 + samples.length * 2, true);
//     writeString(view, 8, "WAVE");
//     writeString(view, 12, "fmt ");
//     view.setUint32(16, 16, true);
//     view.setUint16(20, 1, true);
//     view.setUint16(22, channels, true);
//     view.setUint32(24, sampleRate, true);
//     view.setUint32(28, sampleRate * channels * 2, true);
//     view.setUint16(32, channels * 2, true);
//     view.setUint16(34, 16, true);
//     writeString(view, 36, "data");
//     view.setUint32(40, samples.length * 2, true);
//     floatTo16BitPCM(view, 44, samples);
//     return view;
//   };

//   const floatTo16BitPCM = (output, offset, input) => {
//     for (let i = 0; i < input.length; i++, offset += 2) {
//       const s = Math.max(-1, Math.min(1, input[i]));
//       output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
//     }
//   };

//   const writeString = (view, offset, string) => {
//     for (let i = 0; i < string.length; i++) {
//       view.setUint8(offset + i, string.charCodeAt(i));
//     }
//   };

//   // Download Audio Function use if needed
//   const downloadAudio = () => {
//     let a = document.createElement("a");
//     a.href = audio.data;
//     a.download = audio.name + "." + audio.format;
//     a.click();
//   };

//   // Drag and Drop File
//   const handleClick = () => {
//     inputFile.current.click();
//   };
//   const stopEvent = (event) => {
//     event.preventDefault();
//     event.stopPropagation();
//   };

//   const dragAndDropHandler = (event) => {
//     stopEvent(event);
//     setHover(false);
//     event.target.files = event.dataTransfer.files;
//     convertToAudio(event);
//   };
//   const onDragOver = (event) => {
//     stopEvent(event);
//     setHover(true);
//   };
//   const onDragLeave = (event) => {
//     stopEvent(event);
//     setHover(false);
//   };
//   const replacePlaceholder = (content, dataSet = {}) => {
//     if (!content) {
//       return "";
//     }
//     for (let keys in dataSet) {
//       content = content.split(`<${keys}>`).join(dataSet[keys]);
//     }
//     return content;
//   };
//   //Upload Processed File
//   const uploadFileProcessed = async (file) => {
//     let subdomain = new URL(window.location.href).hostname.split(".")[0];
//     let filePath = replacePlaceholder(content?.filePath, {
//       crmId,
//       pageUrl,
//       templateId,
//     });
//     let fileName = `${filePath}/${file.name}.${file.format}`;
//     let url = process.env.DOCUMENT_HELPER;
//     let header = {
//       filename: fileName,
//       type: content?.containerType,
//       "file-operation": "token-url",
//       "process-file": content?.processFile ? config.processFile : "no",
//       "x-functions-key": process.env.DOCUMENT_HELPER_KEY,
//       subdomain: subdomain,
//       Accept: "application/json",
//       "Content-Type": "application/json",
//       "overwrite-file": content?.overwrite ? true : false,
//     };
//     let formData = {};
//     if (content?.apiDetails) {
//       let {
//         extraHeaders = {},
//         apiUrl,
//         extraPayloads = {},
//       } = content.apiDetails;
//       header = { ...header, ...extraHeaders };
//       url = apiUrl || url;
//       formData = {
//         ...formData,
//         ...extraPayloads,
//       };
//     }
//     try {
//       let response = await httpPost(url, formData, {
//         headers: header,
//       });
//       await uploadBlob(response, file);
//     } catch (error) {
//       addHistory(`Error in token fetching: ${error}`);
//       captureResponse("File uploaded fail.", "FAILURE");
//     }
//   };

//   const uploadBlob = async (sas, audio) => {
//     // Enter your storage account name
//     addHistory("Blob upload started", true);

//     const blobServiceClient = new BlobServiceClient(sas);

//     const containerClient = blobServiceClient.getContainerClient(content?.containerType||"generic");

//     const contentData = audio.blob;
//     let dateTime = epochToDateFormatHelper(
//       new Date() / 1000,
//       "(DD-MM-YYYY HH:mm:ss)"
//     );
//     const blobName = `${replacePlaceholder(content?.filePath, {
//       crmId,
//       pageUrl,
//       templateId,
//     })}/${audio.name}_${dateTime}.${audio.format}`;
//     const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//     const uploadBlobResponse = await blockBlobClient.upload(
//       contentData,
//       contentData.size,
//       {
//         onProgress: function (progressEvent) {
//           var percentCompleted = Math.round(
//             (progressEvent.loadedBytes * 100) / contentData.size
//           );
//           setContentDetails(percentCompleted);
//         },
//       }
//     );
//     addHistory(`File uploaded successfully`);
//     captureResponse("File upload successfully", "SUCCESS");
//     setContentDetails(null);

//     // Notifications will be removed after 5sec
//     setTimeout(() => {
//       setHistory([]);
//       captureResponse(null);
//     }, 5000);
//     addHistory(
//       `Upload block blob ${blobName} successfully, ResponseId: ${uploadBlobResponse.requestId}`
//     );
//   };
//   return (
//     <>
//       <div
//         className={hover ? "drop-zone-container hover" : "drop-zone-container"}
//         style={{ width: "auto" }}
//         onDrop={dragAndDropHandler}
//         onDragLeave={onDragLeave}
//         onDragOver={onDragOver}
//       >
//         <CloudUpload color="primary" />
//         {!uploading ? (
//           <p style={{ color: "#054af7" }}>Drag or Drop Files here to upload </p>
//         ) : (
//           ""
//         )}
//         {uploading ? <CircularDeterminate /> : ""}
//         {!uploading ? (
//           <A_Button
//             onClick={handleClick}
//             onDrop={dragAndDropHandler}
//             onDragLeave={onDragLeave}
//             onDragOver={onDragOver}
//             color="primary"
//             // disabled={content.optionConfig && !isPathSelected}
//             label="Click to Upload"
//           />
//         ) : (
//           ""
//         )}
//       </div>
//       <div
//         className="App"
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           flexDirection: "column",
//         }}
//       >
//         <div className="">
//           <input
//             className={"fileinput"}
//             ref={inputFile}
//             type="file"
//             accept=".mp4 , .mp3"
//             onChange={convertToAudio}
//           />
//         </div>
//         <div>
//           {statusHistory.length > 0 &&
//             statusHistory.map((item) => (
//               <TextNotifications message={item.historyLog} />
//             ))}
//         </div>
//         {contentDetails && (
//           <TextNotifications
//             message={`Uploading in progress: ${contentDetails}%`}
//           />
//         )}

//         <TextNotifications
//           message={responseStatus.message}
//           color={responseDataSet[responseStatus.type]}
//         />
//       </div>
//       <div key={`changeDetect_${handleChange}`} style={{ padding: "1rem 0" }}>
//         {" "}
//         <O_HistoricalDocumentUpload
//           content={{
//             ...content,
//             directory: replacePlaceholder(content?.filePath, {
//               crmId,
//               pageUrl,
//               templateId,
//             }),
//           }}
//         />
//       </div>
//     </>
//   );
// };

// // Text Notification Component
// const TextNotifications = ({ message, color }) => {
//   return (
//     <div
//       style={{
//         width: "100%",
//         fontSize: "0.8rem",
//         opacity: "0.8",
//         fontWeight: "600",
//         color,
//       }}
//     >
//       {message}
//     </div>
//   );
// };
