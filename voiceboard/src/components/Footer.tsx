import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  BookOpen,
  MessageSquare,
  Upload,
  Github,
  Mail,
  Heart,
  Zap,
  Shield,
  Users,
  ExternalLink,
  Map,
} from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-warm-beige/95 border-t-2 border-sketch-gray/30 mt-20">
      {/* Bottom Bar */}
      <div className="bg-cream border-t-2 border-sketch-gray/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-sketch-gray text-center sm:text-left font-handwriting">
              <span>© {new Date().getFullYear()} VoxBoard</span>
              <span className="hidden md:inline">•</span>
              <span className="flex items-center">
                <span>Made by</span>
                <a
                  href="https://tarinagarwal.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-sketch-teal hover:text-coral transition-colors"
                >
                  Tarin
                </a>
                <span className="mx-1">&</span>
                <a
                  href="https://sarthak-rawat.web.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-sketch-teal hover:text-coral transition-colors"
                >
                  Sarthak
                </a>
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-sketch-teal">
                <div className="w-2 h-2 bg-sketch-teal rounded-full animate-pulse"></div>
                <span className="font-cyber text-xs">SECURE CONNECTION</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-20 left-10 w-2 h-2 bg-post-it-yellow rounded-full animate-pulse opacity-30"></div>
      <div className="absolute bottom-32 right-20 w-1 h-1 bg-coral rounded-full animate-pulse opacity-40"></div>
      <div className="absolute bottom-16 right-32 w-3 h-3 bg-sketch-teal rounded-full animate-pulse opacity-20"></div>
    </footer>
  );
};

export default Footer;
