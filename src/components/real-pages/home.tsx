"use client";

import { useEffect, useRef, useState } from "react";
import MealLogModal from "@/components/meal-log-modal";

interface HomePageProps {
  onPromptSelect: () => void;
  onMealLogged: () => void;
}

export default function HomePage({ onPromptSelect, onMealLogged }: HomePageProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Prompt generation status
  const [promptStatus, setPromptStatus] = useState<
    "moving" | "thinking" | "ready"
  >("moving");
  const [isMealLogModalOpen, setIsMealLogModalOpen] = useState(false);

  // Motion permission states - initialized as false to avoid hydration mismatch
  const [motionPermissionGranted, setMotionPermissionGranted] = useState(false);
  const [needsMotionPermission, setNeedsMotionPermission] = useState(false);

  // Check if motion permission is needed (client-side only, after mount)
  // This must run in useEffect to avoid hydration mismatch between server/client
  // We intentionally set state here to initialize client-side only values
  useEffect(() => {
    const DeviceMotionEventTyped = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    const needsPermission =
      typeof DeviceMotionEvent !== "undefined" &&
      typeof DeviceMotionEventTyped.requestPermission === "function";

    // eslint-disable-next-line
    setNeedsMotionPermission(needsPermission);

    // If no permission needed (non-iOS), grant automatically
    if (!needsPermission) {
      setMotionPermissionGranted(true);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    // Request camera access
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment", // Use back camera on mobile
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            // @ts-expect-error - focusMode is not in standard MediaTrackConstraints but supported on iOS Safari
            focusMode: "continuous",
          },
        });

        if (video) {
          video.srcObject = stream;

          // Try to enable autofocus using video track settings
          const videoTrack = stream.getVideoTracks()[0];

          // Apply advanced constraints if supported
          if (videoTrack.applyConstraints) {
            try {
              await videoTrack.applyConstraints({
                advanced: [
                  { focusMode: "continuous" } as Record<string, unknown>,
                  { focusDistance: 0 } as Record<string, unknown>,
                ],
              } as MediaTrackConstraints);
            } catch (constraintError) {
              console.log(
                "Could not apply focus constraints:",
                constraintError
              );
            }
          }
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        setCameraError(
          "Unable to access camera. Please grant camera permissions."
        );
      }
    };

    startCamera();

    // Cleanup: stop camera when component unmounts
    return () => {
      if (video?.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Motion detection with state management
  useEffect(() => {
    if (!motionPermissionGranted) return;

    let steadyTimeout: NodeJS.Timeout | null = null;
    let generatingTimeout: NodeJS.Timeout | null = null;
    let wasMoving = true; // Track previous state

    const ACCELERATION_THRESHOLD = 2; // Threshold for linear acceleration (m/s²)
    const ROTATION_THRESHOLD = 100; // Threshold for rotation (rad/s)
    const STEADY_DELAY = 500; // Wait before marking as "steady"
    const GENERATING_DELAY = 1500; // Time to "generate" prompts after becoming steady

    const handleMotion = (event: DeviceMotionEvent) => {
      // Use acceleration (without gravity) for linear movement
      const acceleration = event.acceleration;
      // Use rotationRate for detecting rotation/turning
      const rotation = event.rotationRate;

      let isMoving = false;

      // Check linear acceleration (actual movement, not gravity)
      if (
        acceleration &&
        acceleration.x !== null &&
        acceleration.y !== null &&
        acceleration.z !== null
      ) {
        const totalAcceleration =
          Math.abs(acceleration.x) +
          Math.abs(acceleration.y) +
          Math.abs(acceleration.z);
        if (totalAcceleration > ACCELERATION_THRESHOLD) {
          isMoving = true;
        }
      }

      // Check rotation (phone turning/rotating)
      if (
        rotation &&
        rotation.alpha !== null &&
        rotation.beta !== null &&
        rotation.gamma !== null
      ) {
        const totalRotation =
          Math.abs(rotation.alpha) +
          Math.abs(rotation.beta) +
          Math.abs(rotation.gamma);
        if (totalRotation > ROTATION_THRESHOLD) {
          isMoving = true;
        }
      }

      // Transition FROM not-moving TO moving
      if (isMoving && !wasMoving) {
        // State 1: Moving/Shaking
        setIsLoading(true);
        setPromptStatus("moving");

        // Clear all timeouts
        if (steadyTimeout) clearTimeout(steadyTimeout);
        if (generatingTimeout) clearTimeout(generatingTimeout);
        steadyTimeout = null;
        generatingTimeout = null;
      }

      // Transition FROM moving TO not-moving
      if (!isMoving && wasMoving) {
        // Start steady timeout only on transition
        steadyTimeout = setTimeout(() => {
          // State 2: Steady but generating prompts
          setIsLoading(true);
          setPromptStatus("thinking");

          // Start generating prompts
          generatingTimeout = setTimeout(() => {
            // State 3: Steady and prompts ready
            setIsLoading(false);
            setPromptStatus("ready");
          }, GENERATING_DELAY);
        }, STEADY_DELAY);
      }

      wasMoving = isMoving;
    };

    window.addEventListener("devicemotion", handleMotion);

    return () => {
      window.removeEventListener("devicemotion", handleMotion);
      if (steadyTimeout) clearTimeout(steadyTimeout);
      if (generatingTimeout) clearTimeout(generatingTimeout);
    };
  }, [motionPermissionGranted]);

  // Request motion permission (must be called from user gesture)
  const requestMotionPermission = async () => {
    const DeviceMotionEventTyped = DeviceMotionEvent as unknown as {
      requestPermission?: () => Promise<"granted" | "denied">;
    };

    try {
      if (DeviceMotionEventTyped.requestPermission) {
        const permissionState =
          await DeviceMotionEventTyped.requestPermission();
        if (permissionState === "granted") {
          setMotionPermissionGranted(true);
          setNeedsMotionPermission(false);
        }
      }
    } catch (error) {
      console.error("Error requesting motion permission:", error);
    }
  };

  const suggestedPrompts = [
    "😤 Log the meal",
    "🤔 Should I eat this?",
    "😕 Is this healthy?",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      console.log("User input:", inputValue);
      // Handle the input here
      setInputValue("");
    }
  };

  const handlePromptClick = (promptIndex: number) => {
    if (promptIndex === 0) {
      // First prompt: "Log the meal" - Open modal
      setIsMealLogModalOpen(true);
    } else {
      // Other prompts: Navigate to chat
      onPromptSelect();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Camera Video Background */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Semi-transparent Grey Overlay with Rounded Square Transparent Center Hole */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Rounded square - transparent hole positioned in upper half */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2"
          style={{
            top: "10%",
            width: "80vw",
            height: "80vw",
            borderRadius: "24px",
            boxShadow: "0 0 0 100vmax rgba(0, 0, 0, 0.75)",
          }}
        >
          {/* Four corner "L" shapes for focus effect */}
          {/* Top-left corner */}
          <svg
            className="absolute"
            style={{ top: "8px", left: "8px" }}
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
          >
            <path
              d="M 16 2 Q 2 2 2 16 L 2 30 Q 2 32 4 32 Q 6 32 6 30 L 6 16 Q 6 6 16 6 L 30 6 Q 32 6 32 4 Q 32 2 30 2 Z"
              fill="white"
            />
          </svg>

          {/* Top-right corner */}
          <svg
            className="absolute"
            style={{ top: "8px", right: "8px" }}
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
          >
            <path
              d="M 44 2 Q 58 2 58 16 L 58 30 Q 58 32 56 32 Q 54 32 54 30 L 54 16 Q 54 6 44 6 L 30 6 Q 28 6 28 4 Q 28 2 30 2 Z"
              fill="white"
            />
          </svg>

          {/* Bottom-left corner */}
          <svg
            className="absolute"
            style={{ bottom: "8px", left: "8px" }}
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
          >
            <path
              d="M 16 58 Q 2 58 2 44 L 2 30 Q 2 28 4 28 Q 6 28 6 30 L 6 44 Q 6 54 16 54 L 30 54 Q 32 54 32 56 Q 32 58 30 58 Z"
              fill="white"
            />
          </svg>

          {/* Bottom-right corner */}
          <svg
            className="absolute"
            style={{ bottom: "8px", right: "8px" }}
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
          >
            <path
              d="M 44 58 Q 58 58 58 44 L 58 30 Q 58 28 56 28 Q 54 28 54 30 L 54 44 Q 54 54 44 54 L 30 54 Q 28 54 28 56 Q 28 58 30 58 Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Camera Error Message */}
      {cameraError && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-4 py-2 rounded-lg text-center max-w-xs">
          {cameraError}
        </div>
      )}

      {/* Motion Permission Request */}
      {needsMotionPermission && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-6 py-4 rounded-2xl shadow-2xl text-center max-w-xs z-50">
          <p className="text-black mb-4 text-sm">
            Enable motion detection to detect phone stability
          </p>
          <button
            onClick={requestMotionPermission}
            className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 active:bg-gray-700 transition-colors"
          >
            Enable Motion Detection
          </button>
        </div>
      )}

      {/* Motion Status Indicator */}
      {motionPermissionGranted && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
          {promptStatus === "moving" && "📳 Not Steady"}
          {promptStatus === "thinking" && "🤔 Thinking..."}
          {promptStatus === "ready" && "✓ Ready"}
        </div>
      )}

      {/* Prompt Generation Area - Lower Half */}
      <div className="absolute bottom-29 left-0 right-0 px-4 flex flex-col items-center gap-4">
            {suggestedPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => !isLoading && handlePromptClick(index)}
                disabled={isLoading}
            className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 text-white shadow-lg hover:bg-white/30 active:bg-white/40 transition-all flex items-center gap-2 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              // Loading state - spinning icon with skeleton placeholder
              <>
                {/* Spinning Circle Icon */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-spin"
                >
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                  <path d="M12 2 A10 10 0 0 1 22 12" />
                </svg>
                {/* Skeleton placeholder bar */}
                <div className="h-3 w-32 bg-white/40 rounded-full animate-pulse"></div>
              </>
            ) : (
              // Prompt content
              <>
                {index === 0 ? (
                  // Spanner/Wrench icon for "Log the meal" - tool action
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                ) : (
                  // Lightbulb Icon for other prompts - suggestions/ideas
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18h6" />
                    <path d="M10 22h4" />
                    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.48.5 2.75 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
                  </svg>
                )}
                {prompt}
              </>
            )}
          </button>
        ))}
      </div>

      {/* Text Input at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pb-8">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative w-full">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-12 rounded-full bg-white/90 backdrop-blur-sm border-none outline-none text-black placeholder-gray-500 shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 active:bg-gray-700 transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Meal Log Modal */}
      <MealLogModal
        isOpen={isMealLogModalOpen}
        onClose={() => setIsMealLogModalOpen(false)}
        onMealLogged={onMealLogged}
      />
    </div>
  );
}
