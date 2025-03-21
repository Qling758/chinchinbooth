"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlipHorizontal,
  Sun,
  Contrast,
  ImageOff,
  Sparkles,
  Wand,
  RefreshCw,
  Undo2,
  Camera,
  Download,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Timer,
  X,
  // ImageIcon,
  Palette,
  GripHorizontal,
  // Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Spotlight } from "@/components/ui/spotlight";
import html2canvas from "html2canvas-pro";
// import { Input } from "@/components/ui/input";

// Constants
const MAX_CAPTURE = 8;
const DEFAULT_FILTERS = {
  brightness: 100,
  contrast: 100,
  grayscale: 0,
  sepia: 0,
  saturate: 100,
  blur: 0,
};

// Types
interface Control {
  id: string;
  icon: React.ComponentType<{ className: string; title?: string }>;
  action: string;
}

interface StepProgressProps {
  currentStep: number;
}

interface PhotoShootProps {
  capturedImages: string[];
  setCapturedImages: React.Dispatch<React.SetStateAction<string[]>>;
  canProceedToLayout: boolean;
  goToLayoutScreen: () => void;
}

interface LayoutSelectionProps {
  capturedImages: string[];
  previewRef: React.RefObject<HTMLDivElement | null>;
  layoutType: number;
  selectedIndices: number[];
  setSelectedIndices: React.Dispatch<React.SetStateAction<number[]>>;
  setLayoutType: React.Dispatch<React.SetStateAction<number>>;
  selectedFrame: string | null;
  setSelectedFrame: React.Dispatch<React.SetStateAction<string | null>>;
  retakePhotos: () => void;
  downloadComposite: () => Promise<void>;
  canDownload: boolean;
  isDownloading: boolean;
}

// Filter Controls
const FILTER_CONTROLS: Control[] = [
  { id: "mirror", icon: FlipHorizontal, action: "mirror" },
  { id: "brightness", icon: Sun, action: "brightness" },
  { id: "contrast", icon: Contrast, action: "contrast" },
  { id: "grayscale", icon: ImageOff, action: "filter" },
  { id: "sepia", icon: Sparkles, action: "filter" },
  { id: "saturate", icon: Wand, action: "filter" },
  { id: "reset", icon: RefreshCw, action: "reset" },
];

// Enhanced color palette inspired by rose-to-teal gradient
const COLOR_PALETTE = [
  // Rose/Pink shades
  "#F9A8D4", // Pink-300
  "#F472B6", // Pink-400
  "#EC4899", // Pink-500
  "#DB2777", // Pink-600

  // Teal shades
  "#5EEAD4", // Teal-300
  "#2DD4BF", // Teal-400
  "#14B8A6", // Teal-500
  "#0D9488", // Teal-600

  // Primary colors
  "#EF4444", // Red-500
  "#F59E0B", // Amber-500
  "#10B981", // Emerald-500
  "#3B82F6", // Blue-500
  "#8B5CF6", // Violet-500

  // Neutral colors
  "#FFFFFF", // White
  "#F3F4F6", // Gray-100
  "#9CA3AF", // Gray-400
  "#111827", // Gray-900
];

// Gradient presets for frames - updated to match the rose-teal theme
const GRADIENT_PRESETS = [
  { name: "Rose Teal", value: "linear-gradient(to right, #FBCFE8, #99F6E4)" },
  { name: "Sunset", value: "linear-gradient(to right, #FEF3C7, #FECACA)" },
  { name: "Ocean", value: "linear-gradient(to right, #BFDBFE, #A5F3FC)" },
  { name: "Candy", value: "linear-gradient(to right, #FBD0E8, #DDD6FE)" },
  { name: "Mint", value: "linear-gradient(to right, #A7F3D0, #BAE6FD)" },
  { name: "Peach", value: "linear-gradient(to right, #FED7AA, #FEE2E2)" },
];

// Available frames
const FRAMES = [
  { id: "none", name: "No Frame", url: null },
  {
    id: "birthday",
    name: "Birthday",
    url: "/birthday-frame-removebg-preview.png",
  },
  {
    id: "party",
    name: "Party",
    url: "/placeholder.svg?height=400&width=400",
  },
  {
    id: "hearts",
    name: "Hearts",
    url: "/placeholder.svg?height=400&width=400",
  },
];

// Replace the timer options and selection logic in the PhotoShoot component
const TIMER_OPTIONS = [3, 5, 10] as const;
const DEFAULT_TIMER_INDEX = 1; // Default to 5 seconds (index 1)

// Update the Navbar component with the provided gradient
function Navbar() {
  return (
    <motion.nav
      className="relative flex w-full items-center justify-center overflow-hidden border-b bg-gradient-to-r from-rose-100 to-teal-100 p-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Spotlight className="top-10 left-0 md:-top-20 md:left-60" fill="white" />
      <h1 className="relative z-10 flex items-center text-2xl font-bold tracking-tight text-gray-800">
        <span className="text-pink-500">@</span>chinchinbooth
      </h1>
    </motion.nav>
  );
}

// Update the StepProgress component with the rose-teal color scheme
function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <motion.div
      className="my-4 flex items-center justify-center space-x-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Step 1 */}
      <motion.div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all duration-300",
          currentStep === 1
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-gray-200 text-gray-600",
        )}
        whileTap={{ scale: 0.95 }}
      >
        1
      </motion.div>

      {/* Connection line */}
      <div className="relative h-0.5 w-12 bg-gray-200">
        <motion.div
          className="bg-primary absolute inset-0"
          initial={{ width: "0%" }}
          animate={{
            width: currentStep === 1 ? "0%" : "100%",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Step 2 */}
      <motion.div
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all duration-300",
          currentStep === 2
            ? "bg-primary text-primary-foreground shadow-sm"
            : "bg-gray-200 text-gray-600",
        )}
        whileTap={{ scale: 0.95 }}
      >
        2
      </motion.div>
    </motion.div>
  );
}

// Update the PhotoShoot component with the rose-teal color scheme
function PhotoShoot({
  capturedImages,
  setCapturedImages,
  canProceedToLayout,
  goToLayoutScreen,
}: PhotoShootProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const capturedImagesRef = useRef<HTMLDivElement>(null);
  const cameraContainerRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isMirrored, setIsMirrored] = useState(true);
  const [isCameraStarted, setIsCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>(["mirror"]);
  const [isCapturing, setIsCapturing] = useState(false);

  // Mode toggles and auto sequence state
  const [isAutoModeEnabled, setIsAutoModeEnabled] = useState(false); // just mode toggle
  const [isAutoSequenceActive, setIsAutoSequenceActive] = useState(false); // whether auto capture sequence is running

  const [selectedTimerIndex, setSelectedTimerIndex] =
    useState<number>(DEFAULT_TIMER_INDEX);
  const [countdown, setCountdown] = useState<number | null>(null);

  const filterDisabled = !isCameraStarted;
  const isMaxCaptureReached = capturedImages.length >= MAX_CAPTURE;
  const selectedTimer = TIMER_OPTIONS[selectedTimerIndex];

  const cycleTimer = () => {
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
        setCameraError(
          "Camera access is required. Please enable camera access in your browser settings and reload the page.",
        );
      }
    };
    startCamera();
  }, [isCameraStarted]);

  // Auto-scroll when new capture is added and stop auto sequence if max capture reached
  useEffect(() => {
    if (capturedImagesRef.current && capturedImages.length > 0) {
      capturedImagesRef.current.scrollLeft =
        capturedImagesRef.current.scrollWidth;
    }
    if (capturedImages.length >= MAX_CAPTURE && isAutoSequenceActive) {
      stopAutoSequence();
    }
  }, [capturedImages.length]);

  // Modify the captureImage function to remove the flash effect
  const captureImage = () => {
    if (
      !isCameraStarted ||
      !videoRef.current ||
      !canvasRef.current ||
      capturedImages.length >= MAX_CAPTURE ||
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
    ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%)`;

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

  // Undo last capture
  const undoCapture = () => {
    if (capturedImages.length) {
      setCapturedImages((prev) => prev.slice(0, -1));
    }
  };

  // Reset all captures and stop auto sequence
  const resetCaptures = () => {
    setCapturedImages([]);
    stopAutoSequence();
  };

  // Reset filters to default
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setActiveFilters(["mirror"]);
  };

  // Toggle individual filter
  const toggleFilter = (id: string) => {
    if (filterDisabled) return;

    if (id === "mirror") {
      setIsMirrored((prev) => !prev);
      setActiveFilters((prev) =>
        prev.includes("mirror")
          ? prev.filter((f) => f !== "mirror")
          : [...prev, "mirror"],
      );
    } else if (id === "grayscale") {
      setFilters((prev) => ({
        ...prev,
        grayscale: prev.grayscale === 0 ? 100 : 0,
        sepia: 0,
      }));
      setActiveFilters((prev) => {
        const newFilters = prev.filter(
          (f) => f !== "sepia" && f !== "grayscale",
        );
        return prev.includes("grayscale")
          ? newFilters
          : [...newFilters, "grayscale"];
      });
    } else if (id === "sepia") {
      setFilters((prev) => ({
        ...prev,
        sepia: prev.sepia === 0 ? 100 : 0,
        grayscale: 0,
      }));
      setActiveFilters((prev) => {
        const newFilters = prev.filter(
          (f) => f !== "sepia" && f !== "grayscale",
        );
        return prev.includes("sepia") ? newFilters : [...newFilters, "sepia"];
      });
    } else if (id === "brightness") {
      setFilters((prev) => ({
        ...prev,
        brightness: prev.brightness === 100 ? 130 : 100,
      }));
      setActiveFilters((prev) =>
        prev.includes("brightness")
          ? prev.filter((f) => f !== "brightness")
          : [...prev, "brightness"],
      );
    } else if (id === "contrast") {
      setFilters((prev) => ({
        ...prev,
        contrast: prev.contrast === 100 ? 130 : 100,
      }));
      setActiveFilters((prev) =>
        prev.includes("contrast")
          ? prev.filter((f) => f !== "contrast")
          : [...prev, "contrast"],
      );
    } else if (id === "saturate") {
      setFilters((prev) => ({
        ...prev,
        saturate: prev.saturate === 100 ? 150 : 100,
      }));
      setActiveFilters((prev) =>
        prev.includes("saturate")
          ? prev.filter((f) => f !== "saturate")
          : [...prev, "saturate"],
      );
    }
  };

  // Start capture (single-shot or auto-capture)
  const startCapture = () => {
    if (capturedImages.length >= MAX_CAPTURE) return;
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
      return;
    }
    if (countdown > 0) {
      hasCapturedRef.current = false;
      const timerId = setTimeout(() => {
        setCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (countdown === 0 && !hasCapturedRef.current) {
      hasCapturedRef.current = true;
      captureImage();
    }
  }, [countdown]);

  // After captureImage completes, schedule the next auto capture if in auto mode
  const scheduleNextAutoCapture = () => {
    if (isAutoSequenceActive && capturedImages.length < MAX_CAPTURE - 1) {
      setTimeout(() => {
        hasCapturedRef.current = false;
        setCountdown(selectedTimer);
      }, 1000);
    } else {
      setIsAutoSequenceActive(false);
      setCountdown(null);
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
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    capturedImages,
    isCameraStarted,
    filters,
    isMirrored,
    isCapturing,
    isAutoSequenceActive,
    countdown,
    isMaxCaptureReached,
    canProceedToLayout,
    goToLayoutScreen,
  ]);

  // Update the UI with the rose-teal color scheme
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center space-y-4 p-3 select-none">
      {/* Badge and keyboard shortcuts info */}
      <motion.div
        className="flex w-full items-center justify-between"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Badge
          variant="outline"
          className="border-gray-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm"
        >
          <span className="text-primary font-bold">
            {capturedImages.length}
          </span>
          <span className="mx-1">/</span>
          <span>{MAX_CAPTURE}</span>
        </Badge>

        <div className="text-xs text-gray-600">
          <span className="font-medium">Space</span>: Capture |{" "}
          <span className="font-medium">Delete</span>: Undo |{" "}
          <span className="font-medium">Esc</span>: Reset
        </div>
      </motion.div>

      {/* Camera view with standard border */}
      {cameraError ? (
        <div className="rounded-lg bg-red-50 p-4 text-center font-bold text-red-500">
          {cameraError}
        </div>
      ) : (
        <motion.div
          ref={cameraContainerRef}
          className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-gray-200 bg-black shadow-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
              style={{
                transform: isMirrored ? "scaleX(-1)" : "scaleX(1)",
                filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) grayscale(${filters.grayscale}%) sepia(${filters.sepia}%) saturate(${filters.saturate}%)`,
              }}
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
                  className="text-primary-foreground absolute right-4 bottom-4 flex h-16 w-16 items-center justify-center rounded-full bg-black/50 shadow-lg backdrop-blur-sm"
                >
                  <span className="text-3xl font-bold">{countdown}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Filter controls with consistent button styling */}
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="filter-controls flex flex-wrap justify-center gap-2 md:gap-3">
          {FILTER_CONTROLS.filter((c) => c.id !== "reset").map(
            ({ id, icon: Icon }) => (
              <Button
                key={id}
                onClick={() => toggleFilter(id)}
                disabled={
                  filterDisabled || isAutoSequenceActive || countdown !== null
                }
                variant={activeFilters.includes(id) ? "default" : "outline"}
                className="h-9 w-9 rounded-full p-0 md:h-10 md:w-10"
                size="icon"
              >
                <Icon className="h-4 w-4" />
              </Button>
            ),
          )}

          <Button
            onClick={resetFilters}
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full p-0 md:h-10 md:w-10"
            disabled={
              filterDisabled || isAutoSequenceActive || countdown !== null
            }
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Camera controls with consistent button styling */}
      <motion.div
        className="flex w-full items-center justify-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {/* Left side controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={undoCapture}
            disabled={
              !capturedImages.length ||
              isAutoSequenceActive ||
              countdown !== null
            }
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
              disabled={isAutoSequenceActive || countdown !== null}
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
            disabled={
              !canProceedToLayout &&
              (!isCameraStarted ||
                capturedImages.length >= MAX_CAPTURE ||
                isCapturing)
            }
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
            disabled={
              !isCameraStarted ||
              capturedImages.length >= MAX_CAPTURE ||
              isCapturing ||
              countdown !== null ||
              isAutoSequenceActive
            }
            className="flex h-10 w-10 items-center justify-center rounded-full p-0 font-bold"
            variant={isAutoModeEnabled ? "default" : "outline"}
            size="icon"
          >
            <span className="text-sm font-bold">A</span>
          </Button>

          <Button
            onClick={resetCaptures}
            disabled={
              !capturedImages.length ||
              isAutoSequenceActive ||
              countdown !== null
            }
            className="flex h-10 w-10 items-center justify-center rounded-full p-0"
            variant="outline"
            size="icon"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
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
          <AnimatePresence initial={false}>
            {capturedImages.map((img, index) => (
              <motion.div
                key={index}
                className="aspect-[4/3] flex-shrink-0 snap-center overflow-hidden rounded-lg border border-gray-200 shadow-md"
                style={{ height: "100%" }}
                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -50 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <img
                  src={img || "/placeholder.svg"}
                  alt={`Captured ${index}`}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Update the LayoutSelection component with rose-teal color scheme and hex input
function LayoutSelection({
  capturedImages,
  previewRef,
  layoutType,
  selectedIndices,
  setSelectedIndices,
  setLayoutType,
  selectedFrame,
  // setSelectedFrame,
  retakePhotos,
  downloadComposite,
  canDownload,
  isDownloading,
}: LayoutSelectionProps) {
  const [frameColor, setFrameColor] = useState<string>("#FFFFFF");
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"solid" | "gradient">("solid");

  const selectLayoutType = (type: number) => {
    setLayoutType(type);
    setSelectedIndices([]);
  };

  const toggleSelect = (index: number) =>
    setSelectedIndices((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : prev.length < layoutType
          ? [...prev, index]
          : prev,
    );

  const handleColorChange = (color: string) => {
    setFrameColor(color);
    setSelectedGradient(null);
  };

  const handleGradientChange = (gradient: string) => {
    setSelectedGradient(gradient);
  };

  const renderCell = (idx: number) => {
    const cellContent =
      selectedIndices[idx] !== undefined ? (
        <img
          src={capturedImages[selectedIndices[idx]] || "/placeholder.svg"}
          alt={`Slot ${idx}`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400">
          <span className="text-xs">Empty</span>
        </div>
      );

    const baseClass =
      "w-full aspect-[4/3] flex items-center justify-center transition-all duration-200 overflow-hidden";
    const emptyClass = "border-dashed border border-gray-200 bg-gray-50/50";

    return (
      <div
        key={idx}
        className={`${baseClass} ${selectedIndices[idx] !== undefined ? "" : emptyClass}`}
      >
        {cellContent}
      </div>
    );
  };

  const renderPreview = () => {
    const commonClasses =
      "mx-auto overflow-hidden rounded-md border border-gray-200 shadow-md";

    // Frame overlay
    const frameOverlay = selectedFrame && (
      <div className="pointer-events-none absolute inset-0">
        <img
          src={FRAMES.find((f) => f.id === selectedFrame)?.url || ""}
          alt="Frame"
          className="h-full w-full object-contain"
        />
      </div>
    );

    const backgroundStyle = selectedGradient
      ? { background: selectedGradient }
      : { backgroundColor: frameColor };

    if (layoutType === 4) {
      return (
        <div
          className={cn(
            "relative max-w-[calc((100%-8px)/2+16px)]",
            commonClasses,
          )}
        >
          <div
            ref={previewRef}
            className="flex flex-col gap-4 px-4 pt-4 pb-20"
            style={backgroundStyle}
          >
            <div className="grid grid-cols-1 gap-2">
              {Array.from({ length: 4 }, (_, idx) => renderCell(idx))}
            </div>
            {frameOverlay}
          </div>
        </div>
      );
    }

    return (
      <div className={`${commonClasses} relative`}>
        <div
          ref={previewRef}
          className="px-4 pt-4 pb-20"
          style={backgroundStyle}
        >
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, idx) => renderCell(idx))}
            </div>
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }, (_, idx) => renderCell(idx + 4))}
            </div>
          </div>
          {frameOverlay}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-3">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-6">
          {/* Photo Selection Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <h2 className="mb-2 text-lg font-semibold text-gray-800">
              Select Photos
            </h2>
            <div className="mb-3 flex gap-3">
              <Button
                onClick={() => selectLayoutType(4)}
                variant={layoutType === 4 ? "default" : "outline"}
                className="h-auto rounded-full px-4 py-1 text-sm"
                size="sm"
              >
                Photo Strip (4)
              </Button>
              <Button
                onClick={() => selectLayoutType(8)}
                variant={layoutType === 8 ? "default" : "outline"}
                className="h-auto rounded-full px-4 py-1 text-sm"
                size="sm"
              >
                Photo Strip (8)
              </Button>
            </div>

            <p className="mb-2 text-xs text-gray-600">
              {layoutType === 4
                ? `Select 4 photos (${selectedIndices.length}/4)`
                : `Select 8 photos (${selectedIndices.length}/8)`}
            </p>

            <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-white p-2 sm:grid-cols-3">
              {capturedImages.map((img, index) => {
                const isSelected = selectedIndices.includes(index);
                const selectionIndex = selectedIndices.indexOf(index) + 1;

                return (
                  <motion.div
                    key={index}
                    onClick={() => toggleSelect(index)}
                    className={`relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                      isSelected ? "border-primary z-10" : "border-gray-200"
                    }`}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Photo ${index}`}
                      className="h-full w-full object-cover"
                    />
                    {isSelected && (
                      <div className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
                        {selectionIndex}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Enhanced Frame Customization Section with Color Picker */}
          <motion.div
            className="rounded-lg border border-gray-200 bg-white p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                Frame Customization
              </h2>
              <Button
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 rounded-full"
              >
                <Palette className="h-3.5 w-3.5" />
                <span className="text-xs">Color Options</span>
              </Button>
            </div>

            {/* Color/Gradient Selection Tabs */}
            {colorPickerOpen && (
              <div className="animate-fade-in mb-4">
                <div className="mb-3 flex border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab("solid")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "solid"
                        ? "text-primary border-primary border-b-2"
                        : "hover:text-primary text-gray-500"
                    }`}
                  >
                    Solid Colors
                  </button>
                  <button
                    onClick={() => setActiveTab("gradient")}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === "gradient"
                        ? "text-primary border-primary border-b-2"
                        : "hover:text-primary text-gray-500"
                    }`}
                  >
                    Gradients
                  </button>
                </div>

                {activeTab === "solid" ? (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700">
                      Solid Colors
                    </h3>
                    <div className="mb-3 grid grid-cols-6 gap-2">
                      {COLOR_PALETTE.map((color) => (
                        <motion.button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          style={{ backgroundColor: color }}
                          className={`h-8 w-full flex-shrink-0 rounded-md border-2 transition-all ${
                            frameColor === color && !selectedGradient
                              ? "border-primary shadow-sm"
                              : "border-gray-200"
                          }`}
                          aria-label={`Select ${color}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        ></motion.button>
                      ))}
                    </div>

                    {/* Custom color input */}
                    {/* <div className="mt-2 flex items-center gap-2">
                      <input
                        type="color"
                        value={frameColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="h-8 w-8 cursor-pointer rounded"
                      />
                      <span className="text-xs text-purple-600">
                        Custom color
                      </span>
                    </div> */}
                  </div>
                ) : (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-700">
                      Gradient Presets
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {GRADIENT_PRESETS.map((gradient) => (
                        <motion.button
                          key={gradient.name}
                          onClick={() => handleGradientChange(gradient.value)}
                          style={{ background: gradient.value }}
                          className={`h-10 w-full flex-shrink-0 rounded-md border-2 transition-all ${
                            selectedGradient === gradient.value
                              ? "border-primary shadow-sm"
                              : "border-gray-200"
                          }`}
                          aria-label={`Select ${gradient.name} gradient`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="text-xs font-medium text-gray-800 drop-shadow-sm">
                            {gradient.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Current selection preview */}
            <div className="mt-3 flex items-center gap-2 rounded-md bg-gray-50 p-2">
              <div
                className="h-6 w-6 rounded-md border border-gray-200"
                style={
                  selectedGradient
                    ? { background: selectedGradient }
                    : { backgroundColor: frameColor }
                }
              ></div>
              <span className="text-xs text-gray-700">
                {selectedGradient
                  ? `Gradient: ${GRADIENT_PRESETS.find((g) => g.value === selectedGradient)?.name || "Custom"}`
                  : `Color: ${frameColor}`}
              </span>
            </div>

            {/* Frame Selection */}
            {/* <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-gray-700">
                Frame Style
              </h3>
              <div className="flex flex-wrap gap-2">
                {FRAMES.map((frame) => (
                  <Button
                    key={frame.id}
                    onClick={() =>
                      setSelectedFrame(frame.id === "none" ? null : frame.id)
                    }
                    variant={
                      selectedFrame === frame.id ||
                      (frame.id === "none" && selectedFrame === null)
                        ? "default"
                        : "outline"
                    }
                    className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm"
                    size="sm"
                  >
                    {frame.id === "none" ? (
                      <ImageOff className="h-3 w-3" />
                    ) : (
                      <ImageIcon className="h-3 w-3" />
                    )}
                    {frame.name}
                  </Button>
                ))}
              </div>
            </div> */}
          </motion.div>
        </div>

        {/* Layout Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            Layout Preview
          </h2>
          <div className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-4">
            <div className="w-full max-w-md">{renderPreview()}</div>
          </div>

          {/* Preview tips */}
          <div className="mt-3 rounded-md bg-gray-50 p-3">
            <div className="flex items-start gap-2">
              <GripHorizontal className="mt-0.5 h-4 w-4 text-gray-500" />
              <div>
                <h3 className="text-sm font-medium text-gray-700">
                  Layout Tips
                </h3>
                <p className="mt-1 text-xs text-gray-600">
                  Select your favorite photos and customize the frame color or
                  gradient to create your perfect photo strip. Use the hex input
                  or color picker for precise color matching. Once you&apos;re happy
                  with your design, click the Download button below.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex justify-center gap-3">
        <Button
          onClick={retakePhotos}
          variant="outline"
          className="flex items-center justify-center rounded-full px-4 py-2"
          size="sm"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Retake
        </Button>
        <Button
          onClick={downloadComposite}
          disabled={!canDownload || isDownloading}
          className={cn(
            "flex items-center justify-center rounded-full px-4 py-2 font-medium",
            !canDownload && "cursor-not-allowed",
          )}
          variant={canDownload && !isDownloading ? "default" : "secondary"}
          size="sm"
        >
          {isDownloading ? (
            <>
              <RefreshCw className="mr-1 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Download className="mr-1 h-4 w-4" />
              {canDownload
                ? "Download"
                : `Select ${layoutType - selectedIndices.length} more`}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Update the main PhotoBoothApp component with consistent button styling
export default function PhotoBoothApp() {
  const [step, setStep] = useState<"shoot" | "layout">("shoot");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [layoutType, setLayoutType] = useState<number>(4);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const canProceedToLayout = capturedImages.length === MAX_CAPTURE;
  const canDownload = selectedIndices.length === layoutType;

  const handleStepChange = () => {
    setStep("layout");
  };

  const retakePhotos = () => {
    setCapturedImages([]);
    setSelectedIndices([]);
    setStep("shoot");
  };

  const downloadComposite = async () => {
    if (!previewRef.current || isDownloading) return;

    setIsDownloading(true);

    try {
      const canvas = await html2canvas(previewRef.current, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: null,
        scale: 2, // Higher quality for Retina displays
      });

      const link = document.createElement("a");
      link.download = "chinchinbooth_photo.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    if (step === "layout") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (
          ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")
        )
          return;
        if (e.key === "Escape") retakePhotos();
        if (e.key.toLowerCase() === "d") downloadComposite();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [step]);

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden">
      {/* Dynamic background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] -right-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-rose-200/20 to-pink-200/20 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -left-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-teal-200/20 to-emerald-200/20 blur-3xl"></div>
      </div>

      <Navbar />

      <StepProgress currentStep={step === "shoot" ? 1 : 2} />

      <AnimatePresence mode="wait">
        {step === "shoot" ? (
          <motion.div
            key="shoot"
            className="flex-1 overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <PhotoShoot
              capturedImages={capturedImages}
              setCapturedImages={setCapturedImages}
              canProceedToLayout={canProceedToLayout}
              goToLayoutScreen={handleStepChange}
            />
          </motion.div>
        ) : (
          <motion.div
            key="layout"
            className="flex-1 overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.4 }}
          >
            <LayoutSelection
              capturedImages={capturedImages}
              previewRef={previewRef}
              layoutType={layoutType}
              selectedIndices={selectedIndices}
              setSelectedIndices={setSelectedIndices}
              setLayoutType={setLayoutType}
              selectedFrame={selectedFrame}
              setSelectedFrame={setSelectedFrame}
              retakePhotos={retakePhotos}
              downloadComposite={downloadComposite}
              canDownload={canDownload}
              isDownloading={isDownloading}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
