"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Mic, 
  BrainCircuit, 
  Palette, 
  Zap, 
  MessageSquare, 
  Share2,
  BarChart3,
  GitBranch,
  Building2,
  Clock,
  RefreshCw,
  Network,
  Route,
  Boxes,
  Rocket
} from "lucide-react";
import Footer from "~/components/Footer";

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-cream text-charcoal">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cream"></div>

        <div
          className={`relative z-10 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 ${
            isVisible ? "fade-in-up" : "opacity-0"
          }`}
        >
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 font-handwriting text-charcoal"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            VoxBoard
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl mb-8 text-muted-foreground max-w-3xl mx-auto">
            Speak your ideas and watch them come to life as beautiful diagrams.
            <br />
            <span className="text-sketch-teal font-handwriting text-2xl">
              Real-Time Voice-to-Visual Magic
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/draw"
              className="sketch-button text-lg px-8 py-4 font-handwriting text-xl flex items-center gap-2"
            >
              <Mic className="w-5 h-5" />
              Start Creating
            </Link>
            <a
              href="#demo"
              className="bg-transparent border-2 border-sketch-teal text-sketch-teal hover:bg-sketch-teal hover:text-white px-8 py-4 rounded-xl transition-all duration-300 text-lg font-handwriting hover:rotate-1"
            >
              Watch Demo
            </a>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-post-it-yellow rounded-full animate-bounce opacity-60 transform rotate-12"></div>
        <div
          className="absolute top-40 right-20 w-6 h-6 bg-coral rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div className="absolute bottom-20 left-20 w-3 h-3 bg-sketch-teal rounded-full animate-pulse transform -rotate-45"></div>
      </section>

      {/* Journey Timeline Section */}
      <section
        id="features"
        className="py-20 bg-warm-beige relative overflow-hidden"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-handwriting text-charcoal"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              Your Creative Journey
            </h2>
            <p className="text-xl text-sketch-gray max-w-3xl mx-auto font-handwriting">
              Follow the magical path from voice to visual masterpiece
            </p>
          </div>

          {/* Timeline Container */}
          <div className="relative">
            {/* Central Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-sketch-teal/30 rounded-full hidden lg:block"></div>

            {/* Step 1: Speak */}
            <div className="relative flex flex-col lg:flex-row items-center mb-8 lg:mb-12">
              <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
                <div className="paper-card p-8 transform hover:rotate-1 transition-all duration-300 hover:shadow-sketch-hover">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-post-it-yellow rounded-full flex items-center justify-center mr-4 border-2 border-charcoal/20 font-handwriting font-bold text-charcoal">
                      1
                    </div>
                    <h3 className="text-2xl font-handwriting font-bold text-charcoal flex items-center gap-2">
                      Just Speak Your Mind
                      <Mic className="w-6 h-6 text-sketch-teal" />
                    </h3>
                  </div>
                  <p className="text-sketch-gray text-lg leading-relaxed">
                    Say "let's draw a flowchart showing user registration
                    process" - our advanced voice recognition captures every
                    word with precision.
                  </p>
                  <div className="mt-4 p-3 bg-cream rounded-xl border-l-4 border-post-it-yellow">
                    <p className="font-handwriting text-charcoal italic">
                      "Let's draw a simple login flow with username and
                      password"
                    </p>
                  </div>
                </div>
              </div>

              {/* Central Icon */}
              <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 mb-8 lg:mb-0">
                <div className="w-20 h-20 bg-post-it-yellow rounded-full flex items-center justify-center border-4 border-white shadow-sketch animate-bounce-gentle">
                  <Mic className="w-8 h-8 text-charcoal" />
                </div>
              </div>

              <div className="lg:w-1/2 lg:pl-12">
                <div className="text-center lg:text-left">
                  <div className="w-32 h-32 bg-cream rounded-2xl border-2 border-sketch-gray/20 flex items-center justify-center mx-auto lg:mx-0 mb-4 transform rotate-3 hover:rotate-6 transition-transform">
                    <MessageSquare className="w-12 h-12 text-sketch-gray" />
                  </div>
                  <p className="font-handwriting text-sketch-gray text-lg">
                    Natural speech recognition powered by cutting-edge AI
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-8 lg:mb-12">
              <div className="text-sketch-teal text-4xl animate-bounce-gentle">↓</div>
            </div>

            {/* Step 2: AI Interprets */}
            <div className="relative flex flex-col lg:flex-row-reverse items-center mb-8 lg:mb-12">
              <div className="lg:w-1/2 lg:pl-12 mb-8 lg:mb-0">
                <div className="paper-card p-8 transform hover:-rotate-1 transition-all duration-300 hover:shadow-sketch-hover">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-sketch-teal rounded-full flex items-center justify-center mr-4 border-2 border-white/20 font-handwriting font-bold text-white">
                      2
                    </div>
                    <h3 className="text-2xl font-handwriting font-bold text-charcoal flex items-center gap-2">
                      AI Works Its Magic
                      <BrainCircuit className="w-6 h-6 text-sketch-teal" />
                    </h3>
                  </div>
                  <p className="text-sketch-gray text-lg leading-relaxed">
                    AI analyzes your words, understands the
                    context, and intelligently generates the perfect Mermaid
                    diagram structure.
                  </p>
                  <div className="mt-4 p-3 bg-cream rounded-xl border-l-4 border-sketch-teal">
                    <p className="font-handwriting text-charcoal italic">
                      Converting speech → Understanding intent → Generating
                      diagram code
                    </p>
                  </div>
                </div>
              </div>

              {/* Central Icon */}
              <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 mb-8 lg:mb-0">
                <div className="w-20 h-20 bg-sketch-teal rounded-full flex items-center justify-center border-4 border-white shadow-sketch animate-pulse">
                  <BrainCircuit className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="lg:w-1/2 lg:pr-12">
                <div className="text-center lg:text-right">
                  <div className="w-32 h-32 bg-cream rounded-2xl border-2 border-sketch-gray/20 flex items-center justify-center mx-auto lg:ml-auto lg:mr-0 mb-4 transform -rotate-3 hover:-rotate-6 transition-transform">
                    <Zap className="w-12 h-12 text-sketch-blue" />
                  </div>
                  <p className="font-handwriting text-sketch-gray text-lg">
                    Lightning-fast AI processing in real-time
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-8 lg:mb-12">
              <div className="text-sketch-teal text-4xl animate-bounce-gentle">↓</div>
            </div>

            {/* Step 3: Visual Creation */}
            <div className="relative flex flex-col lg:flex-row items-center mb-8 lg:mb-12">
              <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
                <div className="paper-card p-8 transform hover:rotate-1 transition-all duration-300 hover:shadow-sketch-hover">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center mr-4 border-2 border-white/20 font-handwriting font-bold text-white">
                      3
                    </div>
                    <h3 className="text-2xl font-handwriting font-bold text-charcoal flex items-center gap-2">
                      Watch It Come Alive
                      <Palette className="w-6 h-6 text-coral" />
                    </h3>
                  </div>
                  <p className="text-sketch-gray text-lg leading-relaxed">
                    Your diagram appears instantly on the beautiful Excalidraw
                    canvas. Edit, refine, and perfect your visual masterpiece
                    with intuitive hand-drawn styling.
                  </p>
                  <div className="mt-4 p-3 bg-cream rounded-xl border-l-4 border-coral">
                    <p className="font-handwriting text-charcoal italic">
                      Drag, drop, edit, and style - make it uniquely yours!
                    </p>
                  </div>
                </div>
              </div>

              {/* Central Icon */}
              <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 mb-8 lg:mb-0">
                <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center border-4 border-white shadow-sketch animate-wiggle">
                  <Palette className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="lg:w-1/2 lg:pl-12">
                <div className="text-center lg:text-left">
                  <div className="w-32 h-32 bg-cream rounded-2xl border-2 border-sketch-gray/20 flex items-center justify-center mx-auto lg:mx-0 mb-4 transform rotate-2 hover:rotate-4 transition-transform">
                    <Palette className="w-12 h-12 text-coral" />
                  </div>
                  <p className="font-handwriting text-sketch-gray text-lg">
                    Interactive canvas with hand-drawn charm
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-8 lg:mb-12">
              <div className="text-sketch-teal text-4xl animate-bounce-gentle">↓</div>
            </div>

            {/* Step 4: Real-time Processing */}
            <div className="relative flex flex-col lg:flex-row-reverse items-center mb-8 lg:mb-12">
              <div className="lg:w-1/2 lg:pl-12 mb-8 lg:mb-0">
                <div className="paper-card p-8 transform hover:-rotate-1 transition-all duration-300 hover:shadow-sketch-hover">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-sketch-blue rounded-full flex items-center justify-center mr-4 border-2 border-white/20 font-handwriting font-bold text-white">
                      4
                    </div>
                    <h3 className="text-2xl font-handwriting font-bold text-charcoal flex items-center gap-2">
                      Lightning Fast Results
                      <Zap className="w-6 h-6 text-sketch-blue" />
                    </h3>
                  </div>
                  <p className="text-sketch-gray text-lg leading-relaxed">
                    Watch your ideas transform instantly as you speak. No
                    waiting, no delays - just immediate visual feedback in
                    real-time.
                  </p>
                  <div className="mt-4 p-3 bg-cream rounded-xl border-l-4 border-sketch-blue">
                    <p className="font-handwriting text-charcoal italic">
                      Speak → See → Edit → Perfect - all in seconds!
                    </p>
                  </div>
                </div>
              </div>

              {/* Central Icon */}
              <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 mb-8 lg:mb-0">
                <div className="w-20 h-20 bg-sketch-blue rounded-full flex items-center justify-center border-4 border-white shadow-sketch animate-pulse">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="lg:w-1/2 lg:pr-12">
                <div className="text-center lg:text-right">
                  <div className="w-32 h-32 bg-cream rounded-2xl border-2 border-sketch-gray/20 flex items-center justify-center mx-auto lg:ml-auto lg:mr-0 mb-4 transform -rotate-3 hover:-rotate-6 transition-transform">
                    <span className="text-4xl">💨</span>
                  </div>
                  <p className="font-handwriting text-sketch-gray text-lg">
                    Instant processing with zero lag time
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-8 lg:mb-12">
              <div className="text-sketch-teal text-4xl animate-bounce-gentle">↓</div>
            </div>

            {/* Step 5: Smart Commands */}
            <div className="relative flex flex-col lg:flex-row items-center mb-8 lg:mb-12">
              <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
                <div className="paper-card p-8 transform hover:rotate-1 transition-all duration-300 hover:shadow-sketch-hover">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-post-it-yellow rounded-full flex items-center justify-center mr-4 border-2 border-charcoal/20 font-handwriting font-bold text-charcoal">
                      5
                    </div>
                    <h3 className="text-2xl font-handwriting font-bold text-charcoal flex items-center gap-2">
                      Smart Understanding
                      <BrainCircuit className="w-6 h-6 text-post-it-yellow" />
                    </h3>
                  </div>
                  <p className="text-sketch-gray text-lg leading-relaxed">
                    Natural language processing understands context and intent,
                    making diagram creation as easy as having a conversation
                    with a friend.
                  </p>
                  <div className="mt-4 p-3 bg-cream rounded-xl border-l-4 border-post-it-yellow">
                    <p className="font-handwriting text-charcoal italic">
                      "Add a decision point" → "Connect these boxes" → "Make it
                      colorful"
                    </p>
                  </div>
                </div>
              </div>

              {/* Central Icon */}
              <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 mb-8 lg:mb-0">
                <div className="w-20 h-20 bg-post-it-yellow rounded-full flex items-center justify-center border-4 border-white shadow-sketch animate-wiggle">
                  <BrainCircuit className="w-8 h-8 text-charcoal" />
                </div>
              </div>

              <div className="lg:w-1/2 lg:pl-12">
                <div className="text-center lg:text-left">
                  <div className="w-32 h-32 bg-cream rounded-2xl border-2 border-sketch-gray/20 flex items-center justify-center mx-auto lg:mx-0 mb-4 transform rotate-2 hover:rotate-4 transition-transform">
                    <span className="text-4xl">💭</span>
                  </div>
                  <p className="font-handwriting text-sketch-gray text-lg">
                    Contextual AI that gets what you mean
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-8 lg:mb-12">
              <div className="text-sketch-teal text-4xl animate-bounce-gentle">↓</div>
            </div>

            {/* Step 6: Share & Cross-Platform */}
            <div className="relative flex flex-col lg:flex-row-reverse items-center">
              <div className="lg:w-1/2 lg:pl-12 mb-8 lg:mb-0">
                <div className="paper-card p-8 transform hover:-rotate-1 transition-all duration-300 hover:shadow-sketch-hover">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-coral rounded-full flex items-center justify-center mr-4 border-2 border-white/20 font-handwriting font-bold text-white">
                      6
                    </div>
                    <h3 className="text-2xl font-handwriting font-bold text-charcoal flex items-center gap-2">
                      Share Everywhere
                      <Share2 className="w-6 h-6 text-coral" />
                    </h3>
                  </div>
                  <p className="text-sketch-gray text-lg leading-relaxed">
                    Export, share, or continue editing across any device. Your
                    diagrams work everywhere - from presentations to
                    documentation, desktop to mobile.
                  </p>
                  <div className="mt-4 p-3 bg-cream rounded-xl border-l-4 border-coral">
                    <p className="font-handwriting text-charcoal italic">
                      Desktop, mobile, tablet - create anywhere, anytime!
                    </p>
                  </div>
                </div>
              </div>

              {/* Central Icon */}
              <div className="lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2 mb-8 lg:mb-0">
                <div className="w-20 h-20 bg-coral rounded-full flex items-center justify-center border-4 border-white shadow-sketch animate-float">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
              </div>

              <div className="lg:w-1/2 lg:pr-12">
                <div className="text-center lg:text-right">
                  <div className="w-32 h-32 bg-cream rounded-2xl border-2 border-sketch-gray/20 flex items-center justify-center mx-auto lg:ml-auto lg:mr-0 mb-4 transform -rotate-2 hover:-rotate-4 transition-transform">
                    <span className="text-4xl">📱</span>
                  </div>
                  <p className="font-handwriting text-sketch-gray text-lg">
                    Cross-platform magic that works everywhere
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Diagram Types Section */}
      <section className="py-20 bg-warm-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-handwriting text-charcoal"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              Create Any Diagram Type
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From simple flowcharts to complex system architectures, express
              any idea visually
            </p>
          </div>

          {/* Sketchbook Pages Layout */}
          <div className="relative max-w-7xl mx-auto">
            {/* Background sketchbook texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-cream to-warm-beige opacity-50 rounded-3xl"></div>

            {/* Grid-based scattered pages */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 p-12">
              {/* Page 1: Flowcharts */}
              <div className="relative">
                <div className="w-full h-40 bg-white rounded-lg shadow-sketch border-2 border-sketch-gray/20 transform rotate-1 hover:rotate-3 hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="p-4 h-full flex flex-col items-center justify-center border-l-4 border-post-it-yellow">
                    <BarChart3 className="w-8 h-8 mb-2 text-sketch-teal" />
                    <h3 className="font-handwriting text-charcoal text-lg font-bold">
                      Flowcharts
                    </h3>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-coral rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Page 2: Mind Maps */}
              <div className="relative">
                <div className="w-full h-44 bg-warm-beige rounded-lg shadow-sketch-hover border-2 border-sketch-teal/30 transform -rotate-1 hover:-rotate-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="p-4 h-full flex flex-col items-center justify-center">
                    <GitBranch className="w-10 h-10 mb-2 text-sketch-teal" />
                    <h3 className="font-handwriting text-charcoal text-xl font-bold">
                      Mind Maps
                    </h3>
                    <div className="absolute bottom-2 left-2 w-3 h-3 bg-sketch-teal rounded-full opacity-60"></div>
                    <div className="absolute top-1 left-1 text-sketch-gray text-xs font-handwriting">
                      <Zap className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Page 3: Org Charts */}
              <div className="relative">
                <div className="w-full h-36 bg-post-it-yellow/80 rounded-lg shadow-paper border-2 border-charcoal/20 transform rotate-2 hover:rotate-4 hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="p-3 h-full flex flex-col items-center justify-center">
                    <Building2 className="w-6 h-6 mb-1 text-charcoal" />
                    <h3 className="font-handwriting text-charcoal text-base font-bold">
                      Org Charts
                    </h3>
                    <div className="absolute top-1 right-1 text-charcoal text-xs">
                      📌
                    </div>
                  </div>
                </div>
              </div>

              {/* Page 4: Timelines */}
              <div className="relative">
                <div className="w-full h-40 bg-cream rounded-lg shadow-notebook border-2 border-coral/30 transform rotate-1 hover:rotate-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="p-4 h-full flex flex-col items-center justify-center border-l-4 border-coral">
                    <Clock className="w-8 h-8 mb-2 text-coral" />
                    <h3 className="font-handwriting text-charcoal text-lg font-bold">
                      Timelines
                    </h3>
                    <div className="absolute bottom-1 right-2 text-coral text-sm">
                      →
                    </div>
                  </div>
                </div>
              </div>

              {/* Page 5: Process Flows */}
              <div className="relative">
                <div className="w-full h-42 bg-white rounded-lg shadow-sketch border-2 border-sketch-blue/30 transform -rotate-1 hover:-rotate-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="p-4 h-full flex flex-col items-center justify-center">
                    <RefreshCw className="w-8 h-8 mb-2 text-sketch-blue" />
                    <h3 className="font-handwriting text-charcoal text-lg font-bold">
                      Process Flows
                    </h3>
                    <div className="absolute top-2 left-2 w-1 h-1 bg-sketch-blue rounded-full"></div>
                    <div className="absolute bottom-2 right-2 w-1 h-1 bg-sketch-blue rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Page 6: Network Diagrams */}
              <div className="relative">
                <div className="w-full h-38 bg-soft-beige rounded-lg shadow-paper border-2 border-sketch-gray/20 transform rotate-2 hover:rotate-4 hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="p-3 h-full flex flex-col items-center justify-center">
                    <Network className="w-6 h-6 mb-1 text-sketch-gray" />
                    <h3 className="font-handwriting text-charcoal text-sm font-bold">
                      Network Diagrams
                    </h3>
                    <div className="absolute top-1 right-1 text-sketch-gray text-xs">
                      <Zap className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Page 7: User Journeys */}
              <div className="relative">
                <div className="w-full h-40 bg-warm-beige rounded-lg shadow-sketch-hover border-2 border-post-it-yellow/40 transform -rotate-1 hover:-rotate-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="p-4 h-full flex flex-col items-center justify-center border-l-4 border-post-it-yellow">
                    <Route className="w-8 h-8 mb-2 text-post-it-yellow" />
                    <h3 className="font-handwriting text-charcoal text-lg font-bold">
                      User Journeys
                    </h3>
                    <div className="absolute bottom-2 left-2 text-post-it-yellow text-lg">
                      ✏️
                    </div>
                  </div>
                </div>
              </div>

              {/* Page 8: System Architecture */}
              <div className="relative">
                <div className="w-full h-44 bg-cream rounded-lg shadow-notebook border-2 border-sketch-teal/30 transform rotate-1 hover:rotate-2 hover:scale-105 transition-all duration-300 cursor-pointer">
                  <div className="p-4 h-full flex flex-col items-center justify-center">
                    <Boxes className="w-10 h-10 mb-2 text-sketch-teal" />
                    <h3 className="font-handwriting text-charcoal text-xl font-bold">
                      System Architecture
                    </h3>
                    <div className="absolute top-2 right-2 w-2 h-2 bg-sketch-teal rounded-full"></div>
                    <div className="absolute bottom-1 left-1 text-sketch-teal text-xs font-handwriting">
                      draft
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-16 left-4 text-sketch-gray text-2xl transform rotate-12 opacity-40">
              ✏️
            </div>
            <div className="absolute bottom-8 right-4 text-coral text-xl transform -rotate-45 opacity-50">
              📝
            </div>
            <div className="absolute top-80 left-8 text-post-it-yellow text-lg transform rotate-45 opacity-60">
              <Zap className="w-4 h-4" />
            </div>
            <div className="absolute bottom-16 left-16 text-sketch-teal text-sm font-handwriting opacity-40 transform rotate-6">
              ideas...
            </div>

            {/* Paper clips and pins */}
            <div className="absolute top-8 left-24 w-4 h-1 bg-sketch-gray rounded-full transform rotate-45 opacity-60"></div>
            <div className="absolute top-40 right-24 w-1 h-4 bg-coral rounded-full transform rotate-12 opacity-50"></div>
            <div className="absolute bottom-24 left-32 w-2 h-2 bg-sketch-blue rounded-full opacity-40"></div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 font-handwriting text-charcoal"
              style={{ fontFamily: "var(--font-fredoka)" }}
            >
              See It In Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch how simple voice commands transform into beautiful,
              interactive diagrams
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="aspect-video bg-warm-beige rounded-2xl relative overflow-hidden border-2 border-sketch-gray/20 shadow-notebook">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/sMtsP55SXio"
                title="VoxBoard Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 bg-cream relative overflow-hidden"
        style={{ fontFamily: "var(--font-fredoka)" }}
      >
        <div className="absolute inset-0 bg-cream"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 font-handwriting text-charcoal"
            style={{ fontFamily: "var(--font-fredoka)" }}
          >
            Ready to Transform Your Ideas?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the revolution of voice-powered creativity. Start creating
            beautiful diagrams with just your voice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/draw"
              className="sketch-button text-lg px-8 py-4 font-handwriting text-xl flex items-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              Start Creating Now
            </Link>
            <a
              href="#features"
              className="bg-transparent border-2 border-sketch-teal text-sketch-teal hover:bg-sketch-teal hover:text-white px-8 py-4 rounded-xl transition-all duration-300 text-lg font-handwriting hover:rotate-1"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
