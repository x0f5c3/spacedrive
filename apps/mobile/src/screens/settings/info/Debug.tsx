import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { Text, View } from 'react-native';
import {
	SyncGroupWithLibraryAndDevices,
	toggleFeatureFlag,
	useBridgeMutation,
	useBridgeQuery,
	useDebugState,
	useFeatureFlags,
	useLibraryMutation
} from '@sd/client';
import Card from '~/components/layout/Card';
import { Button } from '~/components/primitive/Button';
import { tw } from '~/lib/tailwind';
import { SettingsStackScreenProps } from '~/navigation/tabs/SettingsStack';
import { getTokens } from '~/utils';

const DebugScreen = ({ navigation }: SettingsStackScreenProps<'Debug'>) => {
	const debugState = useDebugState();
	const featureFlags = useFeatureFlags();
	const [tokens, setTokens] = React.useState({ accessToken: '', refreshToken: '' });
	const accessToken = tokens.accessToken;
	const refreshToken = tokens.refreshToken;
	// const origin = useBridgeQuery(['cloud.getApiOrigin']);
	// const setOrigin = useBridgeMutation(['cloud.setApiOrigin']);

	React.useEffect(() => {
		async function _() {
			const _a = await getTokens();
			setTokens({ accessToken: _a.accessToken, refreshToken: _a.refreshToken });
		}
		_();
	}, []);

	const cloudBootstrap = useBridgeMutation(['cloud.bootstrap']);
	const requestJoinSyncGroup = useBridgeMutation('cloud.syncGroups.request_join');
	const getGroup = useBridgeQuery([
		'cloud.syncGroups.get',
		{
			access_token: accessToken.trim(),
			pub_id: '0192123b-5d01-7341-aa9d-4a08571052ee',
			with_library: true,
			with_devices: true,
			with_used_storage: true
		}
	]);
	// console.log(getGroup.data);
	const currentDevice = useBridgeQuery(['cloud.devices.get_current_device', accessToken.trim()]);
	// console.log('Current Device: ', currentDevice.data);
	const createSyncGroup = useLibraryMutation('cloud.syncGroups.create');

	// const queryClient = useQueryClient();

	return (
		<View style={tw`flex-1 p-4`}>
			<Card style={tw`gap-y-4`}>
				<Text style={tw`font-semibold text-ink`}>Debug</Text>
				<Button onPress={() => (debugState.rspcLogger = !debugState.rspcLogger)}>
					<Text style={tw`text-ink`}>Toggle rspc logger</Text>
				</Button>
				<Text style={tw`text-ink`}>{JSON.stringify(featureFlags)}</Text>
				<Text style={tw`text-ink`}>{JSON.stringify(debugState)}</Text>
				{/* <Button
					onPress={() => {
						navigation.popToTop();
						navigation.replace('Settings');
						debugState.enabled = false;
					}}
				>
					<Text style={tw`text-ink`}>Disable Debug Mode</Text>
				</Button> */}
				{/* <Button
					onPress={() => {
						const url =
							origin.data === 'https://api.spacedrive.com'
								? 'http://localhost:3000'
								: 'https://api.spacedrive.com';
						setOrigin.mutateAsync(url).then(async () => {
							await auth.logout();
							await queryClient.invalidateQueries();
						});
					}}
				>
					<Text style={tw`text-ink`}>Toggle API Route ({origin.data})</Text>
				</Button> */}
				<Button
					onPress={() => {
						navigation.popToTop();
						navigation.navigate('BackfillWaitingStack', {
							screen: 'BackfillWaiting'
						});
					}}
				>
					<Text style={tw`text-ink`}>Go to Backfill Waiting Page</Text>
				</Button>
				{/* <Button
					onPress={async () => {
						await auth.logout();
					}}
				>
					<Text style={tw`text-ink`}>Logout</Text>
				</Button> */}
				<Button
					onPress={async () => {
						const tokens = await getTokens();
						cloudBootstrap.mutate([tokens.accessToken, tokens.refreshToken]);
					}}
				>
					<Text style={tw`text-ink`}>Cloud Bootstrap</Text>
				</Button>
				<Button
					onPress={async () => {
						createSyncGroup.mutate(accessToken.trim());
					}}
				>
					<Text style={tw`text-ink`}>Create Sync Group</Text>
				</Button>
				<Button
					onPress={async () => {
						currentDevice.refetch();
						console.log('Current Device: ', currentDevice.data);
						console.log('Get Group: ', getGroup.data);
						requestJoinSyncGroup.mutate({
							access_token: accessToken.trim(),
							sync_group: getGroup.data! as unknown as SyncGroupWithLibraryAndDevices,
							asking_device: currentDevice.data!
						});
					}}
				>
					<Text style={tw`text-ink`}>Request Join Sync Group</Text>
				</Button>
			</Card>
		</View>
	);
};

export default DebugScreen;
