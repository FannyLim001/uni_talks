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
import { db, storage } from "../firebase";
import { v4 as uuid } from "uuid";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { AES } from "crypto-js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";

const Input = () => {
	const secretKey = "fannywandi";
	const [text, setText] = useState("");
	const [file, setFile] = useState(null);

	const { currentUser } = useContext(AuthContext);
	const { data } = useContext(ChatContext);

	const encryptMessage = (message, key) => {
		return AES.encrypt(message, key).toString();
	};

	const handleSend = async () => {
		const encryptedText = text != null ? encryptMessage(text, secretKey) : null;

		if (file) {
			try {
				const storageRef = ref(storage, uuid());
				const uploadTask = uploadBytesResumable(storageRef, file);
				const snapshot = await uploadTask;

				const downloadURL = await getDownloadURL(snapshot.ref);
				const encryptedURL = encryptMessage(downloadURL, secretKey);

				await updateDoc(doc(db, "chats", data.chatId), {
					messages: arrayUnion({
						id: uuid(),
						encryptedText,
						senderId: currentUser.uid,
						date: Timestamp.now(),
						file: encryptedURL, // Save the encrypted URL
					}),
				});
			} catch (error) {
				console.error("Error uploading or getting download URL:", error);
				// TODO: Handle error appropriately
			}
		} else {
			// Update Firestore without file
			await updateDoc(doc(db, "chats", data.chatId), {
				messages: arrayUnion({
					id: uuid(),
					encryptedText,
					senderId: currentUser.uid,
					date: Timestamp.now(),
				}),
			});
		}

		// Update userChats documents
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
		setFile(null); // Clear the file input
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
				<input
					type="file"
					style={{ display: "none" }}
					id="file"
					onChange={(e) => setFile(e.target.files[0])}
				/>
				<label htmlFor="file" className="file-input">
					<FontAwesomeIcon icon={faFile} size="lg" />
				</label>
				{file && <p>{file.name}</p>}
				<button onClick={handleSend}>Send</button>
			</div>
		</div>
	);
};

export default Input;
