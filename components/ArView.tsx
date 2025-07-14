import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AppMode, Product } from '../types';
import { CubeIcon } from './icons/Icons';

// Provides URLs for both GLB (standard 3D model) and USDZ (for Apple's AR Quick Look).
// This offers a better native AR experience on iOS devices.
const getModelUrls = (product?: Product | null): { glb: string; usdz: string; } => {
    const name = product?.name?.toLowerCase() || '';
    const category = product?.category?.toLowerCase() || '';
    const modelBasePath = "https://modelviewer.dev/shared-assets/models/";
    const sampleModelsBasePath = "https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/";

    // We pair a standard .glb model with a high-quality .usdz model (often from Apple's gallery)
    // to ensure the best experience on all devices. Some models are from the main shared-assets
    // folder, while others are from the Khronos glTF-Sample-Models collection.
    const modelMap: { glb: string, usdz: string, keywords: string[] }[] = [
        { glb: `${modelBasePath}Shoe.glb`, usdz: 'https://developer.apple.com/augmented-reality/quick-look/models/shoes/sneaker_airforce.usdz', keywords: ['shoe', 'sneaker', 'boot', 'footwear'] },
        { glb: `${sampleModelsBasePath}SheenChair/glTF-Binary/SheenChair.glb`, usdz: 'https://developer.apple.com/augmented-reality/quick-look/models/chair/chair_swan.usdz', keywords: ['chair', 'sofa', 'couch', 'stool', 'furniture', 'armchair', 'lounge'] },
        { glb: `${modelBasePath}Mixer.glb`, usdz: 'https://developer.apple.com/augmented-reality/quick-look/models/standmixer/stand_mixer.usdz', keywords: ['mixer', 'blender', 'kitchenware', 'appliance'] },
        { glb: `${sampleModelsBasePath}BoomBox/glTF-Binary/BoomBox.glb`, usdz: 'https://developer.apple.com/augmented-reality/quick-look/models/drummer/toy_drummer.usdz', keywords: ['boombox', 'radio', 'speaker', 'electronics'] },
        { glb: `${modelBasePath}Lantern.glb`, usdz: 'https://developer.apple.com/augmented-reality/quick-look/models/lantern/lantern.usdz', keywords: ['lantern', 'lamp', 'light', 'lighting', 'home goods'] },
        { glb: `${modelBasePath}RobotExpressive.glb`, usdz: 'https://developer.apple.com/augmented-reality/quick-look/models/toy-robot-vintage/toy_robot_vintage.usdz', keywords: ['robot', 'toy', 'droid'] },
        { glb: `${modelBasePath}Horse.glb`, usdz: 'https://developer.apple.com/augmented-reality/quick-look/models/carousel/carousel_horse.usdz', keywords: ['horse', 'pony', 'animal', 'statue'] },
        { glb: `${sampleModelsBasePath}DamagedHelmet/glTF-Binary/DamagedHelmet.glb`, usdz: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/DamagedHelmet/glTF/DamagedHelmet.usdz', keywords: ['helmet', 'headgear'] },
        { glb: `${sampleModelsBasePath}CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb`, usdz: 'https://developer.apple.com/augmented-reality/quick-look/models/car/toy_car.usdz', keywords: ['car', 'vehicle', 'truck', 'automobile'] },
        { glb: `${sampleModelsBasePath}WaterBottle/glTF-Binary/WaterBottle.glb`, usdz: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/WaterBottle/glTF/WaterBottle.usdz', keywords: ['bottle', 'flask', 'drinkware', 'canteen'] },
        { glb: `${sampleModelsBasePath}Avocado/glTF-Binary/Avocado.glb`, usdz: 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/Avocado/glTF/Avocado.usdz', keywords: ['avocado', 'fruit', 'food'] },
        { glb: `${modelBasePath}vintage-camera.glb`, usdz: 'https://developer.apple.com/augmented-reality/quick-look/models/retrotv/tv_retro.usdz', keywords: ['camera'] },
        { glb: `${modelBasePath}buster_drone.glb`, usdz: 'https://developer.apple.com/augmented-reality/quick-look/models/drone/toy_drone.usdz', keywords: ['drone'] },
    ];

    // Prioritize keywords in the product name for a more specific match.
    for (const model of modelMap) {
        for (const keyword of model.keywords) {
            if (name.includes(keyword)) {
                return { glb: model.glb, usdz: model.usdz };
            }
        }
    }

    // Fallback to checking the product's category.
    for (const model of modelMap) {
        for (const keyword of model.keywords) {
            if (category.includes(keyword)) {
                return { glb: model.glb, usdz: model.usdz };
            }
        }
    }

    // The ultimate fun default for anything else.
    return {
        glb: `${modelBasePath}Astronaut.glb`,
        usdz: 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz'
    };
};

const ArView: React.FC = () => {
    const { selectedProduct, setMode, previousMode } = useAppContext();

    if (!selectedProduct) {
        return (
            <div className="text-center p-8">
                <p>No product selected for AR view.</p>
                <button onClick={() => setMode(AppMode.HOME)} className="text-primary font-semibold">
                    &larr; Go back to shopping
                </button>
            </div>
        );
    }
    
    const { glb: modelUrl, usdz: iosModelUrl } = getModelUrls(selectedProduct);
    const posterUrl = selectedProduct.imageUrl;

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => setMode(previousMode)} className="text-primary font-semibold hover:underline">
                    &larr; Back to Product Details
                </button>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-text-primary">{selectedProduct.name}</h2>
                    <p className="text-text-secondary">AR Preview</p>
                </div>
            </div>
            <div className="w-full h-[70vh] rounded-lg shadow-lg overflow-hidden relative bg-gray-200">
                <model-viewer
                    src={modelUrl}
                    ios-src={iosModelUrl}
                    poster={posterUrl}
                    alt={`3D model of ${selectedProduct.name}`}
                    ar
                    arModes="webxr scene-viewer quick-look"
                    cameraControls
                    autoRotate
                    shadowIntensity="1"
                    style={{ width: '100%', height: '100%', '--poster-color': 'transparent' }}
                >
                    <div slot="ar-button" className="absolute bottom-4 right-4">
                        <button className="flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-focus transition-colors">
                            <CubeIcon className="w-6 h-6" />
                            <span>View in your space</span>
                        </button>
                    </div>
                </model-viewer>
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded-lg text-sm">
                    Point your camera at a flat surface to place the object.
                </div>
            </div>
        </div>
    );
};

export default ArView;