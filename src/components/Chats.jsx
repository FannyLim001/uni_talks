import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import { AES, enc } from "crypto-js";

const Chats = () => {
	const secretKey = "fannywandi";

	const [chats, setChats] = useState([]);

	const { currentUser } = useContext(AuthContext);
	const { dispatch } = useContext(ChatContext);

	const decryptMessage = (encryptedText, key) => {
		return AES.decrypt(encryptedText, key).toString(enc.Utf8);
	};

	useEffect(() => {
		const getChats = () => {
			const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
				setChats(doc.data());
			});

			return () => {
				unsub();
			};
		};

		currentUser.uid && getChats();
	}, [currentUser.uid]);

	const handleSelect = (u) => {
		dispatch({ type: "CHANGE_USER", payload: u });
	};

	console.log(Object.entries(chats));
	return (
		<div className="chats">
			{Object.entries(chats)
				?.sort((a, b) => b[1].date - a[1].date)
				.map((chat) => (
					<div
						className="userChat"
						key={chat[0]}
						onClick={() => handleSelect(chat[1].userInfo)}>
						<img src={chat[1].userInfo.photoURL} />
						<div className="userChatInfo">
							<span>{chat[1].userInfo.displayName}</span>
							{chat[1].lastMessage && chat[1].lastMessage.encryptedText && (
								<p>{decryptMessage(chat[1].lastMessage.encryptedText, secretKey)}</p>
							)}
						</div>
					</div>
				))}
		</div>
	);
};

export default Chats;
