
import { Button } from "@/components/atoms/ui/button";
import { MessageSquare, ArrowRight } from "lucide-react";

export const WelcomeScreen = () => {
    const handleFocusChat = () => {
        // Post message to parent to focus chat
        // We try multiple known message types to ensure compatibility
        window.parent.postMessage({ type: 'focus-chat' }, '*');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full animate-in fade-in duration-700">

            {/* Brand / Logo Area */}
            <div className="mb-12 flex items-center justify-center select-none">
                <img
                    src={`${import.meta.env.BASE_URL}logo.svg`}
                    alt="Math Vibe Logo"
                    className="w-[36rem] h-auto"
                />
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#a4a5a3] mb-6 text-center tracking-tight">
                Start Building Your <span className="text-[#1fa598]">Explorable</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl text-center mb-12 leading-relaxed font-light">
                Transform your ideas into interactive learning experiences. Chat with the AI to
                design layouts, add visualizations, and create engaging content.
            </p>

            {/* Action Area */}
            <div className="flex flex-col items-center gap-4">
                <Button
                    onClick={handleFocusChat}
                    size="lg"
                    className="bg-[#1fa598] hover:bg-[#1fbcac] text-white px-8 py-7 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                    <MessageSquare className="w-5 h-5 mr-3" />
                    Start Chatting
                    <ArrowRight className="w-5 h-5 ml-2 opacity-80" />
                </Button>

                <button
                    onClick={handleFocusChat}
                    className="text-sm text-slate-400 flex items-center gap-1 hover:text-[#115e59] transition-colors mt-2 cursor-pointer"
                >
                    Press the button to focus on the chat panel <ArrowRight className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
};
