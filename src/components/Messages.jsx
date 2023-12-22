import { doc, onSnapshot } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";
import Message from "./Message";

const Messages = () => {
	const [messages, setMessages] = useState([]);
	const { data } = useContext(ChatContext);

	useEffect(() => {
		const unSub = onSnapshot(doc(db, "chats", data.chatId), (doc) => {
			if (doc.exists()) {
				setMessages([]);
				setMessages(doc.data().messages);
			}
		});

		return () => {
			unSub();
		};
	}, [data.chatId]);

	//console.log(messages);

	// Group messages by date
	const groupedMessages = messages.reduce((grouped, message) => {
		const date = message.date.toDate().toLocaleDateString("id-ID", {
			weekday: "long",
			day: "2-digit",
			month: "long",
			year: "numeric",
		}); // Assuming timestamp is a Firebase Timestamp
		if (!grouped[date]) {
			grouped[date] = [];
		}
		grouped[date].push(message);
		return grouped;
	}, {});

	//console.log(groupedMessages);

	return (
		<div className="messages">
			{Object.entries(groupedMessages).map(([date, messagesInGroup]) => (
				<div key={date}>
					<div className="message-date">{date}</div>
					{messagesInGroup.map((m) => (
						<Message message={m} key={m.id} />
					))}
				</div>
			))}
		</div>
	);
};

export default Messages;
