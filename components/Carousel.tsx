
import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';

interface CarouselSlide {
    imageUrl: string;
    headline: string;
    description: string;
    cta: {
        text: string;
        onClick: () => void;
    };
}

interface CarouselProps {
    slides: CarouselSlide[];
}

export const Carousel: React.FC<CarouselProps> = ({ slides }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const prevSlide = React.useCallback(() => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, slides.length]);

    const nextSlide = React.useCallback(() => {
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }, [currentIndex, slides.length]);

    React.useEffect(() => {
        const slideInterval = setInterval(nextSlide, 5000); // Auto-play every 5 seconds
        return () => clearInterval(slideInterval);
    }, [nextSlide]);

    if (!slides || slides.length === 0) {
        return null;
    }

    return (
        <div className="w-full h-[50vh] max-h-[500px] rounded-2xl overflow-hidden relative group">
            <div
                style={{ backgroundImage: `url(${slides[currentIndex].imageUrl})` }}
                className="w-full h-full bg-center bg-cover duration-500"
            >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-center">
                    <div className="text-white p-8 max-w-2xl">
                        <h1 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg">{slides[currentIndex].headline}</h1>
                        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-neutral drop-shadow-md">{slides[currentIndex].description}</p>
                        <button
                            onClick={slides[currentIndex].cta.onClick}
                            className="mt-6 bg-accent text-text-primary font-bold py-3 px-8 rounded-full text-lg hover:bg-accent-focus transition-all transform hover:scale-105"
                        >
                            {slides[currentIndex].cta.text}
                        </button>
                    </div>
                </div>
            </div>

            {/* Left Arrow */}
            <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 left-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition-colors">
                <ChevronLeftIcon onClick={prevSlide} className="w-8 h-8" />
            </div>

            {/* Right Arrow */}
            <div className="hidden group-hover:block absolute top-1/2 -translate-y-1/2 right-5 text-2xl rounded-full p-2 bg-black/20 text-white cursor-pointer hover:bg-black/50 transition-colors">
                <ChevronRightIcon onClick={nextSlide} className="w-8 h-8" />
            </div>
            
            {/* Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex justify-center gap-2">
                {slides.map((_, slideIndex) => (
                    <div
                        key={slideIndex}
                        onClick={() => setCurrentIndex(slideIndex)}
                        className={`w-3 h-3 rounded-full cursor-pointer transition-all ${currentIndex === slideIndex ? 'p-2 bg-accent' : 'bg-white/50'}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};