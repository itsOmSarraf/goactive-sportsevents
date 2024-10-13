import { useEffect, useState } from 'react';
import OneSignal from 'react-onesignal';

export const useOneSignal = () => {
	const [isSubscribed, setIsSubscribed] = useState(false);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			OneSignal.isPushNotificationsEnabled((enabled) => {
				setIsSubscribed(enabled);
			});
		}
	}, []);

	const handleSubscriptionChange = async () => {
		if (isSubscribed) {
			await OneSignal.setSubscription(false);
			setIsSubscribed(false);
		} else {
			await OneSignal.registerForPushNotifications();
			setIsSubscribed(true);
		}
	};

	return { isSubscribed, handleSubscriptionChange };
};
