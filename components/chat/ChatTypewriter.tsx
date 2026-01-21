import { useState, useEffect, useRef } from 'react';

interface ChatTypewriterProps {
    content: string;
    onComplete?: () => void;
    speed?: number;
}

export default function ChatTypewriter({ content, onComplete, speed = 15 }: ChatTypewriterProps) {
    const [displayedContent, setDisplayedContent] = useState('');
    const [isComplete, setIsComplete] = useState(false);
    const indexRef = useRef(0);

    useEffect(() => {
        if (!content) {
            setDisplayedContent('');
            indexRef.current = 0;
            return;
        }

        if (content === displayedContent) {
            return;
        }

        let timeoutId: NodeJS.Timeout;

        const type = () => {
            if (indexRef.current < content.length) {
                setDisplayedContent(content.slice(0, indexRef.current + 1));
                indexRef.current++;
                const variableSpeed = speed + (Math.random() * 10 - 5);
                timeoutId = setTimeout(type, variableSpeed);
            } else {
                if (!isComplete) {
                    setIsComplete(true);
                    onComplete?.();
                }
            }
        };

        if (indexRef.current < content.length) {
            type();
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [content, speed, isComplete, onComplete, displayedContent]);

    return (
        <span className="whitespace-pre-wrap">
            {displayedContent}
            {!isComplete && (
                <span className="inline-block w-1.5 h-4 ml-0.5 bg-blue-500 animate-pulse align-middle" />
            )}
        </span>
    );
}
