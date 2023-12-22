import React, { useContext, useState, useEffect } from "react";
import {
	collection,
	query,
	where,
	onSnapshot,
	getDoc,
	doc,
	setDoc,
	updateDoc,
	serverTimestamp, // Add onSnapshot from firebase
} from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const Search = () => {
	const [username, setUsername] = useState("");
	const [users, setUsers] = useState([]);
	const [err, setErr] = useState(false);

	const { currentUser } = useContext(AuthContext);

	useEffect(() => {
		const searchUsers = async () => {
			if (username.trim() === "") {
				setUsers([]);
				return;
			}

			const q = query(
				collection(db, "users"),
				where("displayName", ">=", username.toLowerCase()),
				where("displayName", "<", username.toLowerCase() + "\uf8ff")
			);

			try {
				const unsubscribe = onSnapshot(q, (querySnapshot) => {
					const results = [];
					querySnapshot.forEach((doc) => {
						results.push(doc.data());
					});
					setUsers(results);
				});

				return () => unsubscribe();
			} catch (err) {
				setErr(true);
			}
		};

		searchUsers();
	}, [username]);

	const handleSelect = async (selectedUser) => {
		// Your existing code for creating chats and updating userChats
		const combinedId =
			currentUser.uid > selectedUser.uid
				? currentUser.uid + selectedUser.uid
				: selectedUser.uid + currentUser.uid;

		try {
			const res = await getDoc(doc(db, "chats", combinedId));

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
			}
		} catch (err) {}

		setUsers([]);
		setUsername("");
	};

	return (
		<div className="search">
			<div className="searchForm">
				<input
					type="text"
					placeholder="Cari Pengguna"
					onChange={(e) => setUsername(e.target.value)}
					value={username}
				/>
			</div>
			<hr />
			{err && <span>Pengguna tidak ditemukan!</span>}
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

export default Search;
