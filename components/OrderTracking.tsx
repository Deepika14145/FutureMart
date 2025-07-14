
import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { getOrderTrackingUpdates } from '../services/geminiService';
import { TrackingEvent, AppMode } from '../types';
import { CheckCircleIcon, CubeIcon, TruckIcon } from './icons/Icons';

const OrderTracking: React.FC = () => {
    const { currentOrder, setMode } = useAppContext();
    const [trackingEvents, setTrackingEvents] = React.useState<TrackingEvent[]>([]);
    const [visibleEventsCount, setVisibleEventsCount] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (currentOrder?.items) {
            setIsLoading(true);
            getOrderTrackingUpdates(currentOrder.items)
                .then(events => {
                    if (events.length > 0 && events[0].status !== 'Error') {
                        setTrackingEvents(events);
                    } else {
                        setError('Could not retrieve tracking information. Please try again later.');
                    }
                })
                .catch(err => {
                    console.error(err);
                    setError('An error occurred while fetching tracking data.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsLoading(false);
        }
    }, [currentOrder]);

    React.useEffect(() => {
        if (trackingEvents.length > 0 && visibleEventsCount < trackingEvents.length) {
            const timer = setTimeout(() => {
                setVisibleEventsCount(prevCount => prevCount + 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [trackingEvents, visibleEventsCount]);

    if (!currentOrder) {
        return (
            <div className="text-center py-16 px-4 bg-base-100 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-text-primary">No Order Selected</h2>
                <p className="mt-2 text-text-secondary">There is no order to track.</p>
                <button 
                    onClick={() => setMode(AppMode.HOME)}
                    className="mt-6 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-primary-focus transition-colors"
                >
                    Go Shopping
                </button>
            </div>
        );
    }

    const renderIcon = (status: string) => {
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('delivered')) return <CheckCircleIcon className="w-6 h-6" />;
        if (lowerStatus.includes('delivery') || lowerStatus.includes('transit') || lowerStatus.includes('shipped')) return <TruckIcon className="w-6 h-6" />;
        return <CubeIcon className="w-6 h-6" />;
    };

    const visibleEvents = trackingEvents.slice(0, visibleEventsCount);
    const currentEventIndex = visibleEvents.length - 1;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-base-100 p-6 md:p-8 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-6 border-b pb-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-text-primary">Track Your Order</h2>
                        <p className="text-primary font-bold">Order ID: {currentOrder.id}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                         <p className="text-text-secondary">Placed on {currentOrder.date}</p>
                         <p className="font-bold text-lg">${currentOrder.total.toFixed(2)}</p>
                    </div>
                </div>
                
                <div className="mb-8 p-4 bg-neutral rounded-lg">
                    <h3 className="font-bold mb-2 text-text-primary">Items in this shipment:</h3>
                    <ul className="list-disc list-inside text-text-secondary">
                        {currentOrder.items.map(item => (
                            <li key={item.id}>{item.name} (x{item.quantity})</li>
                        ))}
                    </ul>
                </div>

                {isLoading ? (
                    <div className="text-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-text-secondary">Generating your delivery timeline...</p>
                    </div>
                ) : error ? (
                    <p className="text-center p-8 text-error bg-red-50 rounded-lg">{error}</p>
                ) : (
                    <div>
                        <h3 className="text-xl font-bold text-text-primary mb-4">Delivery Timeline</h3>
                        <div className="relative">
                            <div className="absolute left-5 top-2 border-l-2 border-dashed border-gray-300" style={{ height: 'calc(100% - 1rem)' }}></div>
                            <div className="space-y-8">
                                {visibleEvents.map((event, index) => {
                                    const isCurrent = index === currentEventIndex;
                                    const isDelivered = event.status.toLowerCase().includes('delivered');
                                    
                                    return (
                                        <div key={index} className="flex items-start gap-4 relative">
                                            <div className={`z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white ${
                                                isDelivered ? 'bg-success' : isCurrent ? 'bg-primary animate-pulse' : 'bg-text-secondary'
                                            }`}>
                                                {renderIcon(event.status)}
                                            </div>
                                            <div>
                                                <p className={`font-bold ${
                                                    isDelivered ? 'text-success' : isCurrent ? 'text-primary' : 'text-text-primary'
                                                }`}>{event.status}</p>
                                                <p className="text-sm text-text-secondary">{event.location} &middot; {event.timestamp}</p>
                                                <p className="text-text-primary mt-1">{event.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderTracking;