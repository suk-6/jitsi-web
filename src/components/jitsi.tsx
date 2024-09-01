import { JitsiMeeting } from "@jitsi/react-sdk";
import { useGetParams } from "../hooks/useGetParams";
import { decodeToken } from "../utils/decodeToken";
import { IJitsiMeetExternalApi } from "@jitsi/react-sdk/lib/types";
import { Participant } from "../models/participant";
import { useEffect, useState } from "react";

export const JitsiComponent = () => {
	const [myData, setMyData] = useState<Participant | null>(null);
	const { getParams } = useGetParams();
	const token = getParams("token");
	const tokenData = decodeToken(token);

	useEffect(() => {
		console.log(myData);
	}, [myData]);

	useEffect(() => {
		document.title = tokenData.room;
	}, [tokenData.room]);

	return (
		<JitsiMeeting
			domain={import.meta.env.VITE_DOMAIN}
			roomName={tokenData.room}
			jwt={token}
			configOverwrite={{
				startWithAudioMuted: true,
				startWithVideoMuted: true,
				disableModeratorIndicator: true,
				hideRecordingLabel: true,
				localRecording: {
					disable: true,
				},
				breakoutRooms: {
					hideAddRoomButton: true,
				},
				securityUi: {
					hideLobbyButton: true,
					disableLobbyPassword: false,
				},
			}}
			// 작동하지 않음. 서버 사이드에서 설정 필요
			interfaceConfigOverwrite={{
				DEFAULT_WELCOME_PAGE_LOGO_URL: "https://file.suk.kr/cando.svg",
				GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
				HIDE_INVITE_MORE_HEADER: true,
				JITSI_WATERMARK_LINK: "https://suk.kr",
			}}
			userInfo={{
				displayName: tokenData.context.user.name,
				email: tokenData.context.user.email,
			}}
			onApiReady={(externalApi: IJitsiMeetExternalApi) => {
				externalApi.addEventListener("videoConferenceLeft", () =>
					fetch(
						`${import.meta.env.VITE_API_URL}/room/leave?token=${token}`
					).then(() =>
						// 창 닫기
						window.close()
					)
				);

				externalApi.on(
					"videoConferenceJoined",
					// EventListener 오류로 IDE에서 오류 발생
					(data: Participant) => {
						setMyData(data);

						// 추후 유저별 참석 여부를 확인할 때 사용
						// fetch(
						// 	`${
						// 		import.meta.env.VITE_API_URL
						// 	}/join-check?token=${token}`
						// );

						if (
							externalApi.getNumberOfParticipants() === 1 && // 추후 Low Level API에서 녹화 여부 확인하여 녹화 명령 전송
							data.breakoutRoom === false
						) {
							externalApi.executeCommand("startRecording", {
								mode: "file", // Jibri 녹화 진행 (서버사이드 녹화)
							});
						}
					}
				);
			}}
			onReadyToClose={() =>
				fetch(
					`${import.meta.env.VITE_API_URL}/room/terminate?token=${token}`
				).then(() =>
					// 창 닫기
					window.close()
				)
			}
			getIFrameRef={(iframeRef) => {
				iframeRef.className = "w-full h-screen";
			}}
		/>
	);
};
