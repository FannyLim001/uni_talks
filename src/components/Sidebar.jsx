import React, { useContext, useEffect, useState } from "react";
import Navbar from "./Navbar";
import Search from "./Search";
import Chats from "./Chats";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentDots } from "@fortawesome/free-regular-svg-icons";
import { db } from "../firebase";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	serverTimestamp,
	setDoc,
	updateDoc, // Add onSnapshot from firebase
} from "firebase/firestore";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const UserList = ({ users }) => {
	const { currentUser } = useContext(AuthContext);
	const { dispatch } = useContext(ChatContext);

	const handleSelect = async (selectedUser) => {
		// Your existing code for creating chats and updating userChats
		const combinedId =
			currentUser.uid > selectedUser.uid
				? currentUser.uid + selectedUser.uid
				: selectedUser.uid + currentUser.uid;

		try {
			const res = await getDoc(doc(db, "chats", combinedId));
			console.log("hai");

			if (!res.exists()) {
				console.log("tes");
				await setDoc(doc(db, "chats", combinedId), { messages: [] });

				await updateDoc(doc(db, "userChats", currentUser.uid), {
					[combinedId + ".userInfo"]: {
						uid: selectedUser.uid,
						displayName: selectedUser.displayName,
						photoURL: selectedUser.photoURL,
					},
					[combinedId + ".date"]: serverTimestamp(),
				});

				await updateDoc(doc(db, "userChats", selectedUser.uid), {
					[combinedId + ".userInfo"]: {
						uid: currentUser.uid,
						displayName: currentUser.displayName,
						photoURL: currentUser.photoURL,
					},
					[combinedId + ".date"]: serverTimestamp(),
				});
			} else {
				// show chats
				dispatch({ type: "CHANGE_USER", payload: selectedUser });
			}
		} catch (err) {}
	};

	return (
		<div className="chats">
			<h4>Pengguna</h4>
			{users.map((user) => (
				<div key={user.uid} className="userChat" onClick={() => handleSelect(user)}>
					<img src={user.photoURL} alt={user.displayName} />
					<div className="userChatInfo">
						<span>{user.displayName}</span>
					</div>
				</div>
			))}
		</div>
	);
};

const Sidebar = () => {
	const [showUserList, setShowUserList] = useState(false);
	const [users, setUsers] = useState([]);

	useEffect(() => {
		// Fetch user data from Firebase Firestore
		const fetchUsers = async () => {
			try {
				const querySnapshot = await getDocs(collection(db, "users"));
				const userList = querySnapshot.docs.map((doc) => ({
					uid: doc.id,
					...doc.data(),
				}));
				setUsers(userList);
			} catch (error) {
				console.error("Error fetching users:", error);
			}
		};

		fetchUsers();
	}, []); // Run once when the component mounts

	const handleButtonClick = () => {
		setShowUserList(!showUserList);
	};

	return (
		<div className="sidebar">
			<Navbar />
			<Search />
			<Chats />
			<div className="chat-contact">
				<button onClick={handleButtonClick}>
					<FontAwesomeIcon icon={faCommentDots} size="xl" />
				</button>
			</div>

			{showUserList && <UserList users={users} />}
		</div>
	);
};

export default Sidebar;
