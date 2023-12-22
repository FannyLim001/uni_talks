import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { AES, enc } from "crypto-js";
import { getStorage, ref, getMetadata } from "firebase/storage";

const Message = ({ message }) => {
	const secretKey = "fannywandi";

	const { currentUser } = useContext(AuthContext);
	const { data } = useContext(ChatContext);

	const [fileType, setFileType] = useState(null);

	const decryptMessage = (encryptedText, key) => {
		return AES.decrypt(encryptedText, key).toString(enc.Utf8);
	};

	const messageRef = useRef();

	const givenDate = new Date(message.date.toDate());

	useEffect(() => {
		const fetchData = async () => {
			try {
				const fileType = await getFileType();
				setFileType(fileType);
			} catch (error) {
				console.error("Error fetching file type:", error);
				setFileType("unknown");
			}
		};

		fetchData();
		messageRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [message]);

	const decryptMsg = message.encryptedText
		? decryptMessage(message.encryptedText, secretKey)
		: null;
	// Decrypt the original URL
	const decryptedURL = message.file
		? decryptMessage(message.file, secretKey)
		: null;

	const getFileType = async () => {
		try {
			// Use the decrypted URL directly to get metadata
			const storage = getStorage();
			const storageRef = ref(storage, decryptedURL);

			if (!storageRef.name) {
				console.error("Invalid storage reference. Provide a valid path.");
				return "unknown";
			}

			const metadata = await getMetadata(storageRef);
			const contentType = metadata.contentType;

			const imageExtensions = [
				"image/jpeg",
				"image/jpg",
				"image/png",
				"image/gif",
			];
			const documentExtensions = [
				"application/pdf",
				"application/msword",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			];
			const audioExtensions = ["audio/mpeg", "audio/ogg", "audio/wav"];

			if (imageExtensions.includes(contentType)) {
				return "image";
			} else if (documentExtensions.includes(contentType)) {
				return "document";
			} else if (audioExtensions.includes(contentType)) {
				return "audio";
			} else {
				return "unknown";
			}
		} catch (error) {
			console.error("Error fetching file metadata:", error);
			return "unknown";
		}
	};

	return (
		<div>
			<div
				ref={messageRef}
				className={`message ${
					message.senderId === currentUser.uid ? "owner" : ""
				}`}>
				<div className="messageInfo">
					<img
						src={
							message.senderId === currentUser.uid
								? currentUser.photoURL
								: data.user.photoURL
						}
						alt=""
					/>
					<span>
						{givenDate.toLocaleTimeString("id-ID", {
							hour: "numeric",
							minute: "numeric",
						})}
					</span>
				</div>
				<div className="messageContent">
					{decryptMsg && <p>{decryptMsg}</p>}
					{decryptedURL && (
						<>
							{fileType === "image" && <img src={decryptedURL} alt="" />}
							{fileType === "document" && (
								<a href={decryptedURL} target="_blank" rel="noopener noreferrer">
									View Document
								</a>
							)}
							{fileType === "audio" && (
								<audio controls>
									<source src={decryptedURL} type="audio/mp3" />
									Your browser does not support the audio tag.
								</audio>
							)}
							{fileType === "unknown" && <p>Unsupported file type</p>}
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default Message;
