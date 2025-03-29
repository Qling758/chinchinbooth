"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Undo2,
  Camera,
  ArrowRight,
  RotateCcw,
  Timer,
  X,
  CameraIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { PhotoShootProps } from "@/types";
import { MAX_CAPTURE, TIMER_OPTIONS, DEFAULT_TIMER_INDEX } from "@/constants";
import { FilterGallery, generateFilterStyle } from "./filter-gallery";
import type { FilterValues } from "@/types/filters";
import { FILTER_COLLECTIONS } from "@/constants/filters";

export function PhotoShoot({
  capturedImages,
  setCapturedImages,
  canProceedToLayout,
  goToLayoutScreen,
}: PhotoShootProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capturedImagesRef = useRef<HTMLDivElement>(null);
  const cameraContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [currentFilter, setCurrentFilter] = useState<FilterValues>(
    FILTER_COLLECTIONS.normal[0].filter,
  );
  const [isMirrored] = useState(true);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Mode toggles and auto sequence state
  const [isAutoModeEnabled, setIsAutoModeEnabled] = useState(false); // just mode toggle
  const [isAutoSequenceActive, setIsAutoSequenceActive] = useState(false); // whether auto capture sequence is running

  const [selectedTimerIndex, setSelectedTimerIndex] =
    useState<number>(DEFAULT_TIMER_INDEX);
  const [countdown, setCountdown] = useState<number | null>(null);

  const t = useTranslations("HomePage");

  const isMaxCaptureReached = capturedImages.length >= MAX_CAPTURE;
  const selectedTimer = TIMER_OPTIONS[selectedTimerIndex];

  const cycleTimer = () => {
    if (timerDisabled) return;
    setSelectedTimerIndex((prev) => (prev + 1) % TIMER_OPTIONS.length);
  };

  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      if (isCameraStarted) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraStarted(true);
          setCameraError(null);
        }
      } catch {
        setCameraError(t("errors.camera_access_required"));
      }
    };
    startCamera();
  }, [isCameraStarted, t]);

  // Auto-scroll when new capture is added and stop auto sequence if max capture reached
  useEffect(() => {
    if (capturedImagesRef.current && capturedImages.length > 0) {
      capturedImagesRef.current.scrollLeft =
        capturedImagesRef.current.scrollWidth;
    }
    if (isMaxCaptureReached && isAutoSequenceActive) {
      stopAutoSequence();
    }
  }, [capturedImages.length, isMaxCaptureReached, isAutoSequenceActive]);

  // Modify the captureImage function to remove the flash effect
  const captureImage = () => {
    if (
      !isCameraStarted ||
      !videoRef.current ||
      !canvasRef.current ||
      isMaxCaptureReached ||
      isCapturing
    )
      return;

    setIsCapturing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    const { videoWidth: width, videoHeight: height } = videoRef.current;
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);
    ctx.filter = generateFilterStyle(currentFilter);

    // Mirror image if needed
    ctx.setTransform(isMirrored ? -1 : 1, 0, 0, 1, isMirrored ? width : 0, 0);
    ctx.drawImage(videoRef.current, 0, 0, width, height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const imageData = canvas.toDataURL("image/png");

    // Remove flash effect and just add the image
    setCapturedImages((prev) => [...prev, imageData]);
    setIsCapturing(false);
    scheduleNextAutoCapture();
  };

  // Create disable variable for Undo button
  const undoDisabled =
    !capturedImages.length || isAutoSequenceActive || countdown !== null;
  const timerDisabled =
    !isCameraStarted || isAutoSequenceActive || countdown !== null;
  const captureDisabled =
    !canProceedToLayout &&
    (!isCameraStarted || isMaxCaptureReached || isCapturing);
  const autoDisabled =
    !isCameraStarted ||
    isMaxCaptureReached ||
    isCapturing ||
    countdown !== null ||
    isAutoSequenceActive;
  const resetDisabled =
    !capturedImages.length || isAutoSequenceActive || countdown !== null;

  // Undo last capture
  const undoCapture = () => {
    if (undoDisabled) return;
    if (capturedImages.length) {
      setCapturedImages((prev) => prev.slice(0, -1));
    }
  };

  // Reset all captures and stop auto sequence
  const resetCaptures = () => {
    if (resetDisabled) return;
    setCapturedImages([]);
    stopAutoSequence();
  };

  // Start capture (single-shot or auto-capture)
  const startCapture = () => {
    if (isMaxCaptureReached) return;
    // Start countdown with the selected timer
    setCountdown(selectedTimer);
    if (isAutoModeEnabled) {
      setIsAutoSequenceActive(true);
    }
  };

  const stopAutoSequence = () => {
    setIsAutoSequenceActive(false);
    setCountdown(null);
  };

  const toggleAutoMode = () => {
    if (autoDisabled) return;
    setIsAutoModeEnabled((prev) => !prev);
    if (isAutoSequenceActive) {
      stopAutoSequence();
    }
  };

  // Ref to ensure captureImage is only called once when countdown reaches 0
  const hasCapturedRef = useRef(false);

  // Countdown effect: reduce countdown every second and trigger capture when it hits 0
  useEffect(() => {
    if (countdown === null) {
      hasCapturedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (countdown > 0) {
      hasCapturedRef.current = false;
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0 && !hasCapturedRef.current) {
      hasCapturedRef.current = true;
      captureImage();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [countdown]);

  // After captureImage completes, schedule the next auto capture if in auto mode
  const scheduleNextAutoCapture = () => {
    if (isAutoModeEnabled && capturedImages.length < MAX_CAPTURE - 1) {
      setTimeout(() => {
        hasCapturedRef.current = false;
        setCountdown(selectedTimer);
      }, 1000);
    } else {
      setIsAutoSequenceActive(false);
      setCountdown(null);
    }
  };

  // Handle filter change
  const handleFilterChange = (filter: FilterValues) => {
    // Apply the filter immediately
    setCurrentFilter(filter);

    // Add a subtle animation to indicate the filter has changed
    if (videoRef.current) {
      const video = videoRef.current;
      video.classList.add("filter-transition");
      setTimeout(() => {
        video.classList.remove("filter-transition");
      }, 300);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || ""))
        return;
      switch (e.key) {
        case " ":
        case "Enter": {
          if (canProceedToLayout) {
            goToLayoutScreen();
          } else {
            if (isAutoSequenceActive) {
              stopAutoSequence();
            } else {
              if (countdown === null) {
                startCapture();
              } else {
                setCountdown(null);
              }
            }
          }
          break;
        }
        case "Backspace":
        case "Delete":
          undoCapture();
          break;
        case "Escape":
          resetCaptures();
          break;
        case "a":
          toggleAutoMode();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    capturedImages,
    isCameraStarted,
    isMirrored,
    isCapturing,
    isAutoSequenceActive,
    countdown,
    canProceedToLayout,
    goToLayoutScreen,
  ]);

  // Update the UI with the rose-teal color scheme
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center space-y-4 p-3 select-none">
      {/* Camera view with standard border */}
      {cameraError ? (
        <div className="rounded-lg bg-red-50 p-4 text-center font-bold text-red-500">
          {cameraError}
        </div>
      ) : (
        <div className="flex w-full flex-col gap-2">
          <motion.div
            ref={cameraContainerRef}
            className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-200 bg-black"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className={cn(
                  "h-full w-full object-cover",
                  isMirrored ? "-scale-x-100" : "",
                )}
                style={{ filter: generateFilterStyle(currentFilter) }}
              />
              {/* Guide overlay with animated border */}
              <div className="animate-pulse-gentle pointer-events-none absolute inset-4 rounded-lg border-2 border-white/30" />

              {/* Countdown overlay with default styling */}
              <AnimatePresence>
                {countdown !== null && countdown > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="text-primary-foreground absolute right-4 bottom-4 flex h-16 w-16 items-center justify-center rounded-full bg-black/50 shadow-lg"
                  >
                    <span className="text-3xl font-bold">{countdown}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute top-4 right-4 flex items-center gap-1 rounded bg-black/50 px-2 py-1 text-white">
                <CameraIcon className="h-4 w-4" />
                <span>
                  {capturedImages.length}/{MAX_CAPTURE}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Filter Gallery - Redesigned with fixed Normal button */}
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="rounded-lg bg-white">
              <FilterGallery
                onFilterChange={handleFilterChange}
                currentFilter={currentFilter}
                sampleImageUrl="/placeholder.jpg"
              />
            </div>
          </motion.div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Camera controls with consistent button styling */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div className="flex w-full items-center justify-center gap-3">
          {/* Left side controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={undoCapture}
              disabled={undoDisabled}
              className="flex h-10 w-10 items-center justify-center rounded-full p-0"
              variant="outline"
              size="icon"
            >
              <Undo2 className="h-4 w-4" />
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={cycleTimer}
                disabled={timerDisabled}
              >
                <Timer className="h-4 w-4" />
              </Button>
              <div className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium">
                {selectedTimer}
              </div>
            </div>
          </div>

          {/* Center - Main capture button */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              onClick={
                canProceedToLayout
                  ? goToLayoutScreen
                  : isAutoSequenceActive
                    ? stopAutoSequence
                    : countdown === null
                      ? startCapture
                      : () => setCountdown(null)
              }
              disabled={captureDisabled}
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full p-0",
                canProceedToLayout &&
                  "bg-green-400 text-white hover:bg-green-500",
                (isAutoSequenceActive || countdown !== null) &&
                  "bg-red-400 text-white hover:bg-red-500",
              )}
              size="icon"
            >
              {canProceedToLayout ? (
                <ArrowRight className="h-7 w-7" />
              ) : isAutoSequenceActive ? (
                <X className="h-7 w-7" />
              ) : countdown !== null ? (
                <X className="h-7 w-7" />
              ) : (
                <Camera className="h-7 w-7" />
              )}
            </Button>
          </motion.div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            <Button
              onClick={toggleAutoMode}
              disabled={autoDisabled}
              className="flex h-10 w-10 items-center justify-center rounded-full p-0 font-bold"
              variant={isAutoModeEnabled ? "default" : "outline"}
              size="icon"
            >
              <span className="text-sm font-bold">A</span>
            </Button>

            <Button
              onClick={resetCaptures}
              disabled={resetDisabled}
              className="flex h-10 w-10 items-center justify-center rounded-full p-0"
              variant="outline"
              size="icon"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Keyboard shortcuts info */}
        <div className="mt-2 hidden text-xs text-gray-600 lg:block">
          <strong>Delete</strong>: {t("undo")} | <strong>Space</strong>:{" "}
          {t("capture")} | <strong>A</strong>: {t("auto_mode")} |{" "}
          <strong>Esc</strong>: {t("reset")}
        </div>
      </motion.div>

      {/* Captured images display with standard border */}
      {capturedImages.length > 0 && (
        <div
          ref={capturedImagesRef}
          className="custom-scrollbar hide-scrollbar flex w-full snap-x gap-1 overflow-x-auto pb-2 md:gap-2"
          style={{
            height: cameraContainerRef.current
              ? cameraContainerRef.current.clientHeight / 2.5
              : "auto",
          }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {capturedImages.map((img, index) => (
              <motion.div
                key={index}
                className="relative aspect-[4/3] flex-shrink-0 snap-center overflow-hidden rounded-lg border border-gray-200 shadow-md"
                style={{ height: "100%" }}
                initial={{
                  opacity: 0,
                  scale: 0.7,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: index * 0.05, // Stagger effect
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.7,
                  y: 20,
                  transition: {
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: index * 0.03, // Slightly faster stagger for exit
                  },
                }}
                layout
              >
                {/* Image */}
                <motion.img
                  src={img || "/placeholder.svg"}
                  alt={`Captured ${index}`}
                  className="h-full w-full object-cover"
                  initial={{ filter: "blur(8px)" }}
                  animate={{
                    filter: "blur(0px)",
                    transition: { duration: 0.3, delay: 0.1 },
                  }}
                />

                {/* Image number indicator */}
                <motion.div
                  className="bg-primary absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 0.9,
                    transition: {
                      type: "spring",
                      stiffness: 500,
                      damping: 25,
                      delay: 0.2 + index * 0.05,
                    },
                  }}
                >
                  {index + 1}
                </motion.div>

                {/* Subtle overlay gradient */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
