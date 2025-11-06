// hooks/useAVProcessor.ts
import * as React from 'react';
import { TechnicalAnalysis, VideoDevice } from '../types';

interface UseAVProcessorProps {
    onStreamReady?: (stream: MediaStream) => void;
    deviceId?: string;
}

export const useAVProcessor = ({ onStreamReady, deviceId }: UseAVProcessorProps) => {
    const [stream, setStream] = React.useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = React.useState(false);
    const [recordedBlob, setRecordedBlob] = React.useState<Blob | null>(null);
    const [videoDevices, setVideoDevices] = React.useState<VideoDevice[]>([]);
    const [selectedDeviceId, setSelectedDeviceId] = React.useState<string | undefined>(deviceId);
    const [technicalAnalysis, setTechnicalAnalysis] = React.useState<TechnicalAnalysis>({
        audioLevel: 'good',
        lightingLevel: 'good',
    });

    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const recordedChunksRef = React.useRef<Blob[]>([]);
    
    const audioContextRef = React.useRef<AudioContext | null>(null);
    const analyserRef = React.useRef<AnalyserNode | null>(null);
    const analysisIntervalRef = React.useRef<number | null>(null);
    
    // For lighting analysis
    const videoElementForAnalysisRef = React.useRef<HTMLVideoElement | null>(null);
    const canvasForAnalysisRef = React.useRef<HTMLCanvasElement | null>(null);


    const getDevices = React.useCallback(async () => {
        try {
            // Ensure permissions are requested before enumerating devices
            const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevs = devices.filter(d => d.kind === 'videoinput');
            setVideoDevices(videoDevs.map(d => ({ deviceId: d.deviceId, label: d.label })));
            if (videoDevs.length > 0 && !selectedDeviceId) {
                setSelectedDeviceId(videoDevs[0].deviceId);
            }
            // Stop the temporary stream
            tempStream.getTracks().forEach(track => track.stop());
        } catch (error) {
            console.error('Error enumerating devices:', error);
        }
    }, [selectedDeviceId]);

    const stopStream = React.useCallback(() => {
        if (analysisIntervalRef.current) {
            clearInterval(analysisIntervalRef.current);
            analysisIntervalRef.current = null;
        }
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }, [stream]);

    const startStream = React.useCallback(async (deviceId: string) => {
        stopStream();
        try {
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 } },
                audio: { noiseSuppression: true, echoCancellation: true },
            });
            setStream(newStream);
            setSelectedDeviceId(deviceId);
            if (onStreamReady) onStreamReady(newStream);

            // Setup for analysis
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContextRef.current.createMediaStreamSource(newStream);
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            source.connect(analyserRef.current);

            videoElementForAnalysisRef.current = document.createElement('video');
            videoElementForAnalysisRef.current.srcObject = newStream;
            videoElementForAnalysisRef.current.muted = true;
            videoElementForAnalysisRef.current.play();

            canvasForAnalysisRef.current = document.createElement('canvas');

            analysisIntervalRef.current = window.setInterval(() => {
                // Audio analysis
                let audioLevel: TechnicalAnalysis['audioLevel'] = 'good';
                if (analyserRef.current) {
                    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
                    if (average > 100) audioLevel = 'clipping';
                    else if (average < 20) audioLevel = 'low';
                    else audioLevel = 'good';
                }

                // Lighting analysis
                let lightingLevel: TechnicalAnalysis['lightingLevel'] = 'good';
                if (videoElementForAnalysisRef.current && canvasForAnalysisRef.current && videoElementForAnalysisRef.current.readyState >= 2) {
                    const video = videoElementForAnalysisRef.current;
                    const canvas = canvasForAnalysisRef.current;
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
                        let totalBrightness = 0;
                        for (let i = 0; i < imageData.length; i += 4) {
                            totalBrightness += (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
                        }
                        const avgBrightness = totalBrightness / (imageData.length / 4);
                        if (avgBrightness > 200) lightingLevel = 'bright';
                        else if (avgBrightness < 50) lightingLevel = 'dark';
                        else lightingLevel = 'good';
                    }
                }
                
                setTechnicalAnalysis({ audioLevel, lightingLevel });

            }, 500);

        } catch (error) {
            console.error('Error starting stream:', error);
            throw error;
        }
    }, [stopStream, onStreamReady]);

    const switchCamera = React.useCallback(async (newDeviceId: string) => {
        if (newDeviceId !== selectedDeviceId) {
            await startStream(newDeviceId);
        }
    }, [selectedDeviceId, startStream]);

    const startRecording = React.useCallback(() => {
        if (stream) {
            recordedChunksRef.current = [];
            const options = { mimeType: 'video/webm; codecs=vp9' };
            try {
                mediaRecorderRef.current = new MediaRecorder(stream, options);
            } catch (e) {
                console.warn('VP9 codec not supported, falling back.');
                mediaRecorderRef.current = new MediaRecorder(stream);
            }
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                setRecordedBlob(blob);
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
        }
    }, [stream]);

    const stopRecording = React.useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const resetRecording = React.useCallback(() => {
        setRecordedBlob(null);
        recordedChunksRef.current = [];
    }, []);

    React.useEffect(() => {
        return () => stopStream(); // Cleanup on unmount
    }, [stopStream]);

    return {
        stream,
        isRecording,
        recordedBlob,
        videoDevices,
        selectedDeviceId,
        technicalAnalysis,
        getDevices,
        startStream,
        stopStream,
        startRecording,
        stopRecording,
        resetRecording,
        switchCamera,
    };
};
