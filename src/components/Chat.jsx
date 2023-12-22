import React, { useContext, useEffect } from "react";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";

const Chat = () => {
	const { data, dispatch } = useContext(ChatContext);

	useEffect(() => {
		// Clear chat data when the Chat component mounts
		dispatch({ type: "CLEAR_CHAT" });
	}, [dispatch]);

	return (
		<div className="chat">
			<div className="chatInfo">
				<span>{data.user.displayName}</span>
			</div>
			<Messages />
			<Input />
		</div>
	);
};

export default Chat;
