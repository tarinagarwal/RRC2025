import VoiceDraw from "../components/VoiceDraw";

export default function DrawPage() {
  return (
    <div className="min-h-screen bg-[#F9F6EE]">
      {/* Header */}
      <header className="bg-[#335441] text-white py-4 px-6 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Voice Excalidraw</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#E4D7B4]">
              Create diagrams with voice commands
            </span>
          </div>
        </div>
      </header>
      
      {/* Canvas Container */}
      <main className="relative h-[calc(100vh-80px)] border-2 border-[#E4D7B4] rounded-lg bg-white shadow-lg">
        <VoiceDraw />
      </main>
    </div>
  );
}
