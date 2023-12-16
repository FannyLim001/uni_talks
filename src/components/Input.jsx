import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import {
	arrayUnion,
	doc,
	serverTimestamp,
	Timestamp,
	updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuid } from "uuid";
import { AES } from "crypto-js";

const Input = () => {
	const secretKey = "fannywandi";

	const [text, setText] = useState("");

	const { currentUser } = useContext(AuthContext);
	const { data } = useContext(ChatContext);

	const encryptMessage = (message, key) => {
		return AES.encrypt(message, key).toString();
	};

	const handleSend = async () => {
		// Encrypt the message
		const encryptedText = encryptMessage(text, secretKey);

		await updateDoc(doc(db, "chats", data.chatId), {
			messages: arrayUnion({
				id: uuid(),
				encryptedText,
				senderId: currentUser.uid,
				date: Timestamp.now(),
			}),
		});

		await updateDoc(doc(db, "userChats", currentUser.uid), {
			[data.chatId + ".lastMessage"]: {
				encryptedText,
			},
			[data.chatId + ".date"]: serverTimestamp(),
		});

		await updateDoc(doc(db, "userChats", data.user.uid), {
			[data.chatId + ".lastMessage"]: {
				encryptedText,
			},
			[data.chatId + ".date"]: serverTimestamp(),
		});

		setText("");
	};
	return (
		<div className="input">
			<input
				type="text"
				placeholder="Ketikkan Sesuatu..."
				onChange={(e) => setText(e.target.value)}
				value={text}
			/>
			<div className="send">
				<button onClick={handleSend}>Send</button>
			</div>
		</div>
	);
};

export default Input;
