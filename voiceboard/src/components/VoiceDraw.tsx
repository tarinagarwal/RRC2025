import { useEffect, useRef, useState } from "react";
import { api } from "../trpc/react";

import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { type ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types/types";
import { parseMermaidToExcalidraw } from "@excalidraw/mermaid-to-excalidraw";
import { Loader2Icon, Mic, MicOff, Send, Type, Bot } from "lucide-react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { toast } from "../hooks/use-toast";
import { executeRecaptcha, isRecaptchaConfigured } from "../utils/recaptcha";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const VoiceDraw = () => {
  const [mermaid, setMermaid] = useState("");
  const [exAPI, setExAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [shouldRetry, setShouldRetry] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedCommand, setRecordedCommand] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [showBotDialog, setShowBotDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [gemInput, setGemInput] = useState<string>("");

  // State to hold reCAPTCHA token (must be declared before using in query)
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");

  const utils = api.useUtils();

  const transcribeMutation = api.speech.transcribe.useMutation({
    onSuccess: (data) => {
      console.log("Transcription successful:", data.text);
      setRecordedCommand(data.text);
      setIsTranscribing(false);

      if (data.text.toLowerCase().includes("clear the board")) {
        setMermaid("graph TD");
      } else if (data.text.trim()) {
        regen(data.text.trim());
      }
    },
    onError: (error) => {
      console.error("Transcription failed:", error);
      setIsTranscribing(false);
      toast({
        title: "Error",
        description: "Failed to transcribe audio. Please try again.",
      });
    },
  });

  const regen = (in2: string, errorMsg?: string) => {
    setGemInput(in2);
    if (errorMsg) {
      setErrorMessage(errorMsg);
      setShouldRetry(true);
    } else {
      setErrorMessage(undefined);
      setShouldRetry(false);
    }
  };

  const fixSyntax = async (brokenMermaid: string, errorMsg: string) => {
    try {
      setIsLoading(true);

      // Get fresh reCAPTCHA token specifically for syntax fix action
      console.log("🤖 Getting reCAPTCHA token for syntax_fix action...");
      const token = await executeRecaptcha("syntax_fix");

      console.log("🔧 Calling lightweight syntax fix API");
      const result = await utils.mermaid.fixSyntax.fetch({
        brokenMermaid: brokenMermaid,
        error: errorMsg,
        recaptchaToken: token || "",
      });

      if (!result) {
        console.warn("⚠️ No result from syntax fix API");
        return;
      }

      console.log("✅ Syntax fix successful:", result);
      setMermaid(result);
      setRetryCount(0);
      setErrorMessage(undefined);
      setShouldRetry(false);
    } catch (error: any) {
      console.error("❌ Syntax fix failed:", error);

      if (error.message?.includes("BOT_DETECTED")) {
        console.log("🤖 Bot detected during syntax fix, showing dialog");
        setShowBotDialog(true);
      } else {
        // If syntax fix fails, fall back to full regeneration
        console.log("🔄 Syntax fix failed, falling back to full regeneration");
        regen(gemInput, errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get reCAPTCHA token when needed
  const refreshRecaptchaToken = async () => {
    try {
      console.log("🤖 Getting fresh reCAPTCHA token...");
      const token = await executeRecaptcha("diagram_generation");
      setRecaptchaToken(token || "");
      console.log("✅ reCAPTCHA token ready");
      return token || "";
    } catch (error) {
      console.error("❌ Failed to get reCAPTCHA token:", error);
      return "";
    }
  };

  useEffect(() => {
    if (!gemInput) return;

    const generateWithToken = async () => {
      try {
        setIsLoading(true);

        // Get fresh reCAPTCHA token
        const token = await refreshRecaptchaToken();

        console.log("📡 Making API call with fresh token");

        // Make the API call using tRPC utils
        const result = await utils.mermaid.toMer.fetch({
          str: gemInput,
          current: "",
          error: errorMessage,
          recaptchaToken: token,
        });

        if (!result) {
          console.warn("⚠️ No result from API");
          return;
        }

        // Clean the response but preserve the Mermaid syntax
        let cleanedMermaid = result.trim();

        // Remove markdown code blocks if present (already handled in backend, but double-check)
        if (cleanedMermaid.startsWith("```mermaid")) {
          cleanedMermaid = cleanedMermaid
            .replace(/^```mermaid\n/, "")
            .replace(/\n```$/, "");
        } else if (cleanedMermaid.startsWith("```")) {
          cleanedMermaid = cleanedMermaid
            .replace(/^```\n/, "")
            .replace(/\n```$/, "");
        }

        console.log("✅ Processed Mermaid:", cleanedMermaid);
        setMermaid(cleanedMermaid);
        setRetryCount(0);
        setErrorMessage(undefined);
        setShouldRetry(false);
        // Clear recorded command after processing
        setTimeout(() => setRecordedCommand(""), 2000);
      } catch (error: any) {
        console.error("❌ Diagram generation failed:", error);
        console.log("🔍 Error details:", {
          message: error.message,
          data: error.data,
          cause: error.cause,
          fullError: error,
        });

        // Check if it's a bot detection error
        if (
          error.message?.includes("BOT_DETECTED") ||
          error.data?.message?.includes("BOT_DETECTED")
        ) {
          console.log("🤖 Bot detected, showing dialog");
          setShowBotDialog(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    generateWithToken();
  }, [gemInput]);

  useEffect(() => {
    if (shouldRetry && errorMessage) {
      const retryWithToken = async () => {
        try {
          setIsLoading(true); // Show loading indicator during retry

          // Get fresh reCAPTCHA token for retry
          const token = await refreshRecaptchaToken();

          console.log("🔄 Retrying with fresh token");
          const result = await utils.mermaid.toMer.fetch({
            str: gemInput,
            current: "",
            error: errorMessage,
            recaptchaToken: token,
          });

          if (!result) {
            console.warn("⚠️ No result from retry API");
            return;
          }

          // Use the same processing logic as the main generation
          let cleanedMermaid = result.trim();

          // Remove markdown code blocks if present
          if (cleanedMermaid.startsWith("```mermaid")) {
            cleanedMermaid = cleanedMermaid
              .replace(/^```mermaid\n/, "")
              .replace(/\n```$/, "");
          } else if (cleanedMermaid.startsWith("```")) {
            cleanedMermaid = cleanedMermaid
              .replace(/^```\n/, "")
              .replace(/\n```$/, "");
          }

          console.log("✅ Retry processed Mermaid:", cleanedMermaid);
          setMermaid(cleanedMermaid);
          setRetryCount(0);
          setErrorMessage(undefined);
          setShouldRetry(false);
        } catch (error: any) {
          console.error("❌ Retry failed:", error);

          if (error.message?.includes("BOT_DETECTED")) {
            console.log("🤖 Bot detected on retry, showing dialog");
            setShowBotDialog(true);
          }
          setShouldRetry(false);
        } finally {
          setIsLoading(false); // Always clear loading state
        }
      };

      retryWithToken();
    }
  }, [shouldRetry, errorMessage]);

  // Push-to-talk keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === "m" &&
        !isRecording &&
        !isLoading &&
        !isTranscribing &&
        !showTextDialog
      ) {
        e.preventDefault();
        startRecording();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "m" && isRecording) {
        e.preventDefault();
        stopRecording();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [isRecording, isLoading, isTranscribing, showTextDialog]);

  // First-time welcome dialog using localStorage
  useEffect(() => {
    try {
      const hasSeen = localStorage.getItem("voxboard_seen_welcome");
      if (!hasSeen) {
        setShowWelcome(true);
        localStorage.setItem("voxboard_seen_welcome", "true");
      }
    } catch (_) {
      setShowWelcome(true);
    }
  }, []);

  // Detect system dark mode to sync control styling with Excalidraw dark theme
  useEffect(() => {
    try {
      const mq =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
      const set = () => setIsDarkMode(!!mq.matches);
      set();
      if (mq.addEventListener) {
        mq.addEventListener("change", set);
        return () => mq.removeEventListener("change", set);
      }
      // Safari fallback
      if ((mq as any).addListener) {
        (mq as any).addListener(set);
        return () => (mq as any).removeListener(set);
      }
    } catch (_) {
      // no-op
    }
  }, []);

  // Prefer Excalidraw theme if available once API is ready
  useEffect(() => {
    if (!exAPI) return;
    try {
      const appState = (exAPI as any).getAppState?.();
      if (appState && typeof appState.theme === "string") {
        setIsDarkMode(appState.theme === "dark");
      }
    } catch (_) {
      // ignore
    }
  }, [exAPI]);

  const startRecording = async () => {
    if (isLoading || isTranscribing) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Clear previous audio chunks
      audioChunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          await processAudio(audioBlob);
        }
      };

      setIsRecording(true);
      mediaRecorder.start();
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      setIsRecording(false);
      mediaRecorderRef.current.stop();
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsTranscribing(true);

      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(
        String.fromCharCode(...new Uint8Array(arrayBuffer))
      );

      // Send to Groq for transcription
      transcribeMutation.mutate({
        audioData: base64Audio,
        mimeType: audioBlob.type,
      });
    } catch (error) {
      console.error("Error processing audio:", error);
      setIsTranscribing(false);
      toast({
        title: "Error",
        description: "Failed to process audio recording.",
      });
    }
  };

  useEffect(() => {
    void convert(mermaid);
  }, [mermaid]);

  async function convert(mermaid: string) {
    if (exAPI) {
      try {
        console.log("🔄 Attempting to parse Mermaid syntax:", mermaid);

        // AGGRESSIVE FIX: Handle all possible diagram type issues
        let fixedMermaid = mermaid.trim();

        console.log(
          "🔍 Original Mermaid:",
          fixedMermaid.substring(0, 50) + "..."
        );

        // Check for stuck diagram type patterns like "graph TBstart" or "graph TB start"
        const stuckPatterns = [
          /^(graph\s*TB)([a-zA-Z])/i,
          /^(graph\s*TD)([a-zA-Z])/i,
          /^(graph\s*BT)([a-zA-Z])/i,
          /^(graph\s*LR)([a-zA-Z])/i,
          /^(graph\s*RL)([a-zA-Z])/i,
        ];

        let wasFixed = false;
        for (const pattern of stuckPatterns) {
          const match = fixedMermaid.match(pattern);
          if (match) {
            console.log("🔧 Found stuck pattern:", match[0]);
            fixedMermaid =
              match[1] + "\n    " + fixedMermaid.substring(match[1].length);
            wasFixed = true;
            break;
          }
        }

        // If no diagram type found at all, add it
        if (
          !wasFixed &&
          !/^(graph\s|classDiagram|sequenceDiagram|stateDiagram-v2)/i.test(
            fixedMermaid
          )
        ) {
          console.log("🔧 No diagram type found, prepending 'graph TB'");
          fixedMermaid = "graph TB\n    " + fixedMermaid;
          wasFixed = true;
        }

        // CRITICAL FIX: Repair broken labeled arrows that are split across lines
        // Pattern: "nodeA -->|label|\n    nodeB" should become "nodeA -->|label| nodeB"
        const originalLength = fixedMermaid.length;
        fixedMermaid = fixedMermaid.replace(
          /(\w+\s*-->\s*\|[^|]*\|\s*)\n\s*(\w+)/g,
          "$1 $2"
        );

        // Also fix regular arrows split across lines
        fixedMermaid = fixedMermaid.replace(
          /(\w+\s*-->\s*)\n\s*(\w+)/g,
          "$1 $2"
        );

        if (fixedMermaid.length !== originalLength) {
          console.log("🔧 Fixed broken arrow connections");
          wasFixed = true;
        }

        if (wasFixed) {
          console.log(
            "🔧 Fixed Mermaid syntax:",
            fixedMermaid.substring(0, 100) + "..."
          );
        } else {
          console.log("✅ Mermaid syntax looks good, no fixes needed");
        }

        const { elements } = await parseMermaidToExcalidraw(fixedMermaid);

        if (!elements) {
          console.warn("⚠️ No elements returned from Mermaid parser");
          return;
        }

        console.log(
          "✅ Successfully parsed Mermaid, converting to Excalidraw elements"
        );
        const excalidrawElements = convertToExcalidrawElements(elements);

        console.log("🎨 Adding new diagram to existing scene...");

        // Get current scene elements
        const currentScene = exAPI.getSceneElements();
        console.log("📊 Current scene has", currentScene.length, "elements");

        // Calculate smart positioning for new diagram
        let offsetX = 0;
        let offsetY = 0;

        if (currentScene.length > 0) {
          // Find the rightmost and bottommost positions of existing elements
          const maxX = Math.max(
            ...currentScene.map((el) => el.x + (el.width || 0))
          );
          const maxY = Math.max(
            ...currentScene.map((el) => el.y + (el.height || 0))
          );

          // Position new diagram to the right with some padding
          offsetX = maxX + 200; // 200px padding from rightmost element
          offsetY = 50; // Small top margin

          console.log("📍 Positioning new diagram at:", { offsetX, offsetY });
        }

        // Offset new elements to avoid overlap and make them selected
        const offsetElements = excalidrawElements.map((element) => ({
          ...element,
          x: element.x + offsetX,
          y: element.y + offsetY,
          isSelected: true, // Make new elements selected so user can move them
        }));

        // Combine existing (unselected) and new (selected) elements
        const unselectedExisting = currentScene.map((el) => ({
          ...el,
          isSelected: false,
        }));
        const allElements = [...unselectedExisting, ...offsetElements];

        console.log("📊 Total elements after adding:", allElements.length);
        console.log("✨ New elements are selected and ready to move");

        exAPI.updateScene({
          elements: allElements,
          appState: {
            ...exAPI.getAppState(),
            selectedElementIds: offsetElements.reduce((acc, el) => {
              acc[el.id] = true;
              return acc;
            }, {} as Record<string, true>),
          },
        });

        console.log("📍 Focusing on new content...");
        exAPI.scrollToContent(offsetElements, { fitToViewport: true });

        setRetryCount(0);
        setErrorMessage(undefined);
        setShouldRetry(false);
        console.log("✅ Successfully rendered diagram in Excalidraw");
      } catch (err) {
        console.error("❌ MERMAID PARSING ERROR:");
        console.error("Error object:", err);
        console.error(
          "Error name:",
          err instanceof Error ? err.name : "Unknown"
        );
        console.error(
          "Error message:",
          err instanceof Error ? err.message : "Unknown parsing error"
        );
        console.error(
          "Error stack:",
          err instanceof Error ? err.stack : "No stack trace"
        );
        console.error("Failed Mermaid syntax:");
        console.error("---START MERMAID---");
        console.error(mermaid);
        console.error("---END MERMAID---");

        // Additional debugging info
        if (err instanceof Error) {
          console.error("Error details:");
          console.error("- Type:", typeof err);
          console.error("- Constructor:", err.constructor.name);
          console.error("- Keys:", Object.keys(err));

          // Try to extract more specific error information
          if ("cause" in err) {
            console.error("- Cause:", err.cause);
          }
          if ("code" in err) {
            console.error("- Code:", (err as any).code);
          }
          if ("location" in err) {
            console.error("- Location:", (err as any).location);
          }
        }

        if (retryCount < 5) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown parsing error";
          const nextRetryCount = retryCount + 1;
          setRetryCount(nextRetryCount);

          toast({
            title: "Error",
            description: `Fixing Mermaid syntax... (Attempt ${nextRetryCount}/5)`,
          });

          console.error(
            `� Uesing lightweight syntax fix... (Attempt ${nextRetryCount}/5)`
          );
          console.error("Sending broken syntax for correction:", errorMessage);

          // Use lightweight syntax fixing instead of full regeneration
          fixSyntax(mermaid, errorMessage);
        } else {
          toast({
            title: "Error",
            description: "Maximum retry attempts reached. Clearing the board.",
          });
          console.error(
            "❌ Maximum retry attempts reached. Resetting to empty graph."
          );
          setMermaid("graph TD");
          setRetryCount(0);
          setErrorMessage(undefined);
          setShouldRetry(false);
        }
      }
    }
  }

  // Check for MediaRecorder support
  if (!navigator.mediaDevices || !window.MediaRecorder) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <span className="text-[#46704A] text-lg">
          Browser doesn't support audio recording.
        </span>
      </div>
    );
  }

  // Mobile push-to-talk handlers
  // Deprecated in favor of click-to-toggle; retained for keyboard (M) handling logic above

  const handleMicTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isLoading && !isTranscribing) {
      startRecording();
    }
  };

  const handleMicTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && !isLoading) {
      regen(textInput.trim());
      setTextInput("");
      setShowTextDialog(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit(e);
    }
  };

  return (
    <div className="w-full h-full">
      {/* Welcome Dialog - updated for main client styling */}
      <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
        <DialogContent
          className="bg-white border-2 border-[#A9B782]/30 shadow-lg"
          closeClassName="text-[#ff4d4f] border-2 border-[#ff4d4f] rounded-md p-1.5 hover:bg-[#ff4d4f] hover:text-white transition-colors flex items-center justify-center w-8 h-8"
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#335441] text-center">
              Welcome to Voice Excalidraw
            </DialogTitle>
            <DialogDescription className="text-[#6B8F60] text-center mt-2">
              Generate diagrams from your voice and text.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-[#335441] mt-4">
            <p>
              - Hold <span className="font-bold">M</span> to speak and release
              to stop.
            </p>
            <p>- Click the mic to push-to-talk on mobile.</p>
            <p>- Use the Type button to open text-to-diagram.</p>
          </div>
          <DialogFooter className="mt-6">
            <button
              className="bg-[#335441] text-white hover:bg-[#46704A] px-8 py-3 rounded-lg transition-all"
              onClick={() => setShowWelcome(false)}
            >
              Got it
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Canvas Container - updated for main client styling */}
      <div className="relative h-full w-full">
        <Excalidraw
          excalidrawAPI={(api) => setExAPI(api)}
          onChange={(_, appState: any) => {
            if (appState && typeof appState.theme === "string") {
              setIsDarkMode(appState.theme === "dark");
            }
          }}
        />

        {/* Status bubble - updated for main client styling */}
        <div className="pointer-events-none flex items-center justify-center text-[#335441]">
          {isRecording || isTranscribing || recordedCommand ? (
            <p className="animate-grow absolute bottom-24 left-1/2 z-20 -translate-x-1/2 rounded-2xl bg-[#A9B782] border-2 border-[#335441]/20 p-4 text-center text-xl text-[#1a1a1a] opacity-90 shadow-md font-medium">
              <span className="inline-flex items-center gap-2">
                {isRecording ? (
                  <>
                    <Mic className="w-5 h-5" />
                    <span>Recording...</span>
                  </>
                ) : isTranscribing ? (
                  <>
                    <Loader2Icon className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : recordedCommand ? (
                  <>{recordedCommand}</>
                ) : (
                  <></>
                )}
              </span>
            </p>
          ) : (
            <div />
          )}
          {isLoading && (
            <div className="absolute bottom-1/2 left-1/2 z-20 -translate-x-1/2 rounded-2xl bg-[#8D9B72] border-2 border-white/20 px-3 italic opacity-90 shadow-md flex flex-row items-center">
              <Loader2Icon className="animate-spin text-white mr-2" />
              <span className="text-white">
                drawing...
              </span>
            </div>
          )}
        </div>

        {/* Bottom Controls Overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-20 sm:bottom-4 z-30 sm:z-50 flex w-full items-center justify-center">
          <div className="pointer-events-auto flex items-center gap-3 px-4 sm:px-0">
            {/* Mic Button with tooltip */}
            <div className="relative group">
              <button
                className={`rounded-xl p-3 sm:p-2 min-w-[48px] min-h-[48px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center transition duration-200 ease-in-out ${
                  isRecording
                    ? "bg-[#8D9B72] border-[#8D9B72]"
                    : "bg-white border-[#335441] text-[#335441] hover:bg-[#A9B782] hover:border-[#A9B782] hover:text-white"
                } border-2 ${
                  isLoading || isTranscribing
                    ? "cursor-not-allowed opacity-50"
                    : "hover:shadow-md active:scale-95"
                }`}
                onClick={() => {
                  if (isLoading || isTranscribing) return;
                  if (isRecording) {
                    stopRecording();
                  } else {
                    void startRecording();
                  }
                }}
                onTouchStart={handleMicTouchStart}
                onTouchEnd={handleMicTouchEnd}
              >
                {isLoading || isTranscribing ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>
              <span className="pointer-events-none absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow bg-black text-white">
                Voice to Diagram
                <br />
                Click or Hold M
              </span>
            </div>

            {/* Type Button with tooltip -> opens dialog */}
            <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
              <div className="relative group">
                <DialogTrigger asChild>
                  <button
                    className={`rounded-xl p-3 sm:p-2 min-w-[48px] min-h-[48px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center transition duration-200 ease-in-out border-2 ${
                      isLoading || isTranscribing
                        ? "cursor-not-allowed opacity-50 bg-gray-200 border-gray-300 text-gray-500"
                        : "bg-white border-[#335441] text-[#335441] hover:bg-[#A9B782] hover:border-[#A9B782] hover:text-white hover:shadow-md active:scale-95"
                    }`}
                    disabled={isLoading || isTranscribing}
                  >
                    <div className="relative">
                      <Type className="w-5 h-5" />
                      {(isLoading || isTranscribing) && (
                        <div className="absolute top-1/2 left-1/2 w-6 h-0.5 transform -translate-x-1/2 -translate-y-1/2 rotate-45 bg-black"></div>
                      )}
                    </div>
                  </button>
                </DialogTrigger>
                <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow bg-black text-white">
                  Text to Diagram
                </span>
              </div>
              <DialogContent 
                className="bg-white border-2 border-[#A9B782] max-w-md"
                closeClassName="text-[#ff4d4f] border-2 border-[#ff4d4f] rounded-md p-1.5 hover:bg-[#ff4d4f] hover:text-white transition-colors flex items-center justify-center w-8 h-8"
              >
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-[#335441]">
                    Text to Diagram
                  </DialogTitle>
                  <DialogDescription className="text-[#6B8F60]">
                    Describe what you want, and we will generate a diagram.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleTextSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. draw a login flow with success & error"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 rounded-lg border-2 border-[#A9B782] bg-white text-[#335441] placeholder-[#6B8F60]/60 focus:outline-none focus:ring-2 focus:ring-[#A9B782] focus:border-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!textInput.trim() || isLoading}
                    className="bg-[#335441] hover:bg-[#46704A] text-white px-4 py-2 rounded-lg transition-all"
                  >
                    {isLoading ? (
                      <Loader2Icon className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Bot Detection Dialog - updated for main client styling */}
      <Dialog open={showBotDialog} onOpenChange={setShowBotDialog}>
        <DialogContent className="sm:max-w-md bg-white border-4 border-dashed border-gray-300 rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl font-bold text-gray-800 mb-2">
              <Bot className="w-7 h-7 text-[#A9B782]" /> Beep Boop! Bot Alert
            </DialogTitle>
            <DialogDescription className="text-gray-600 leading-relaxed">
              Oops! Our super-smart AI thinks you might be a robot{" "}
              <Bot className="inline align-text-bottom w-5 h-5 text-[#A9B782]" />
              <br />
              <br />
              Don't worry, even humans get this sometimes! Try again in a
              moment, or reach out if you think we made a mistake.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6">
            <button
              onClick={() => setShowBotDialog(false)}
              className="bg-[#335441] hover:bg-[#46704A] text-white px-8 py-3 rounded-lg transition-all w-full"
            >
              Got it! 👍
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VoiceDraw;
