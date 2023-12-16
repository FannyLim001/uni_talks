import React, { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { AES, enc } from "crypto-js";

const Message = ({ message }) => {
	const secretKey = "fannywandi";

	const { currentUser } = useContext(AuthContext);
	const { data } = useContext(ChatContext);

	const decryptMessage = (encryptedText, key) => {
		return AES.decrypt(encryptedText, key).toString(enc.Utf8);
	};

	const ref = useRef();

	useEffect(() => {
		ref.current?.scrollIntoView({ behavior: "smooth" });
	}, [message]);

	// Decrypt the message text
	const decryptedText = decryptMessage(message.encryptedText, secretKey);

	return (
		<div
			ref={ref}
			className={`message ${message.senderId === currentUser.uid && "owner"}`}>
			<div className="messageInfo">
				<img
					src={
						message.senderId === currentUser.uid
							? currentUser.photoURL
							: data.user.photoURL
					}
					alt=""
				/>
				<span>just now</span>
			</div>
			<div className="messageContent">
				<p>{decryptedText}</p>
				{message.img && <img src={message.img} alt="" />}
			</div>
		</div>
	);
};

export default Message;
