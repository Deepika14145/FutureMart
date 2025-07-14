
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLoyalty } from '../contexts/LoyaltyContext';
import { Badge } from '../types';
import { TrophyIcon, StarIcon, HeartIcon, SparklesIcon } from './icons/Icons';

const BadgeIcon: React.FC<{ icon: Badge['icon'], className?: string }> = ({ icon, className }) => {
    switch (icon) {
        case 'Trophy': return <TrophyIcon className={className} />;
        case 'Star': return <StarIcon className={className} fill="currentColor" />;
        case 'Heart': return <HeartIcon className={className} fill="currentColor"/>;
        case 'Sparkles': return <SparklesIcon className={className} />;
        default: return <StarIcon className={className} fill="currentColor" />;
    }
};

const Rewards: React.FC = () => {
    const { user } = useAuth();
    const { badges, isLoading, error, fetchBadges } = useLoyalty();

    React.useEffect(() => {
        if (user) {
            fetchBadges();
        }
    }, [user, fetchBadges]);

    if (!user) {
        return <div className="text-center p-8">Please log in to see your rewards.</div>
    }

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-text-secondary">Checking for your awesome badges...</p>
                </div>
            );
        }

        if (error) {
            return <div className="text-center p-8 text-error bg-red-50 rounded-lg">{error}</div>;
        }

        if (badges.length === 0) {
             return (
                <div className="text-center p-8 text-text-secondary bg-neutral rounded-lg">
                    <h3 className="text-xl font-bold text-text-primary">No Badges Yet!</h3>
                    <p className="mt-2">Keep shopping to unlock achievements and earn cool badges.</p>
                </div>
            );
        }
        
        return (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map(badge => (
                    <div key={badge.id} className="bg-base-100 p-6 rounded-lg shadow-sm flex items-center gap-5 border-l-4 border-accent">
                        <div className="flex-shrink-0 text-accent">
                             <BadgeIcon icon={badge.icon} className="w-10 h-10" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-text-primary">{badge.name}</h3>
                            <p className="text-sm text-text-secondary mt-1">{badge.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        )
    };
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-base-100 p-8 rounded-lg shadow-sm mb-8 text-center">
                <TrophyIcon className="w-12 h-12 mx-auto text-primary" />
                <h2 className="mt-2 text-3xl font-extrabold text-text-primary">Your Rewards</h2>
                <p className="mt-2 text-2xl font-bold text-accent">
                    {user.points} <span className="text-xl font-semibold text-text-secondary">Points</span>
                </p>
                <p className="mt-1 text-text-secondary">You're doing great! Here are the badges you've earned.</p>
            </div>

            {renderContent()}
        </div>
    );
};

export default Rewards;