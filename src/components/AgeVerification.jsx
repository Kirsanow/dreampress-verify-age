import { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import Logo from "./Logo";

export default function AgeVerification({ onComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [status, setStatus] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setStatus("Loading AI models...");
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.ageGenderNet.loadFromUri("/models"),
      ]);
      setModelsLoaded(true);
      setStatus("Ready for verification");
    } catch (error) {
      console.error("Error loading models:", error);
      setStatus("Failed to load AI models");
    }
  };

  const startCamera = async () => {
    console.log("startCamera called, modelsLoaded:", modelsLoaded);
    if (!modelsLoaded) {
      console.log("Models not loaded yet");
      return;
    }

    setIsLoading(true);
    setStatus("Starting camera...");

    try {
      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });
      console.log("Camera stream obtained:", stream);

      // Show camera UI first, then set up the video
      setShowCamera(true);
      setStatus("Setting up camera...");

      // Wait a bit for React to render the video element
      setTimeout(async () => {
        if (videoRef.current) {
          console.log("Video element found, setting srcObject");
          videoRef.current.srcObject = stream;

          console.log("Starting video playback...");
          await videoRef.current.play();
          console.log("Video play() completed");

          setStatus("Position your face in the camera");
          console.log("Camera started and UI updated");
        } else {
          console.error("Video ref is still null after timeout");
          setStatus("Video element not found");
        }
        setIsLoading(false);
      }, 100);
    } catch (error) {
      console.error("Camera access error:", error);
      setStatus(`Camera error: ${error.message}`);
      setIsLoading(false);
    }
  };

  const verifyAge = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    setIsLoading(true);
    setStatus("Analyzing your age...");

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withAgeAndGender();

      if (detections.length === 0) {
        setStatus(
          "No face detected. Please position yourself clearly in the camera."
        );
        setIsLoading(false);
        return;
      }

      const detection = detections[0];
      const estimatedAge = Math.round(detection.age);
      const isOver18 = estimatedAge >= 18;

      setVerificationResult({
        age: estimatedAge,
        verified: isOver18,
      });

      setStatus(
        isOver18
          ? `Verification successful! Estimated age: ${estimatedAge}`
          : `Access denied. Estimated age: ${estimatedAge}`
      );

      // Stop camera
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }

      setShowCamera(false);

      // Complete verification after delay
      setTimeout(() => {
        onComplete(isOver18.toString());
      }, 2000);
    } catch (error) {
      console.error("Age verification error:", error);
      setStatus("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 gradient-bg">
      {/* Background gradient orbs */}
      <div className="gradient-orb-1"></div>
      <div className="gradient-orb-2"></div>
      <div className="gradient-orb-3"></div>

      <div className="relative z-10 w-full max-w-md text-center brand-card">
        <div className="brand-card-inner">
          <Logo className="mx-auto mb-6" />
          <h1 className="mb-2 text-2xl font-black tracking-tight text-white">
            Age Verification
          </h1>

          {!showCamera && !verificationResult && (
            <div className="flex flex-col items-center space-y-8">
              <p className="text-sm text-gray-300">
                We need to verify that you are 18 or older
              </p>

              <button
                onClick={startCamera}
                disabled={!modelsLoaded || isLoading}
                className="mx-auto btn-primary"
              >
                {isLoading ? "Loading..." : "Start Age Verification"}
              </button>
            </div>
          )}

          {showCamera && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="object-cover w-full h-64 bg-black/50 rounded-2xl"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>

              <button
                onClick={verifyAge}
                disabled={isLoading}
                className="mx-auto btn-primary"
              >
                {isLoading ? "Analyzing..." : "Verify My Age"}
              </button>
            </div>
          )}

          {verificationResult && (
            <div
              className={`p-6 rounded-2xl ${
                verificationResult.verified
                  ? "bg-green-500/10 border border-green-500/30"
                  : "bg-red-500/10 border border-red-500/30"
              }`}
            >
              <h2
                className={`text-lg font-semibold ${
                  verificationResult.verified
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {verificationResult.verified
                  ? "Verification Successful"
                  : "Access Denied"}
              </h2>
              <p className="mt-2 text-gray-400">
                Estimated age: {verificationResult.age} years
              </p>
            </div>
          )}

          <p className="mt-4 text-sm text-gray-400">{status}</p>
        </div>
      </div>
    </div>
  );
}
