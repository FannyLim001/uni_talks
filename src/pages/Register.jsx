import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, storage, db } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

export const Register = () => {
	const [selectedFile, setSelectedFile] = useState(null);
	const [err, setErr] = useState(false);
	const navigate = useNavigate();

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		setSelectedFile(file);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const displayName = e.target[0].value;
		const email = e.target[1].value;
		const password = e.target[2].value;
		const file = e.target[3].files[0];

		//console.log(username, email, password);
		try {
			const res = await createUserWithEmailAndPassword(auth, email, password);

			const storageRef = ref(storage, displayName);

			const uploadTask = uploadBytesResumable(storageRef, file);

			uploadTask.on(
				(error) => {
					// Handle unsuccessful uploads
					setErr(true);
				},
				() => {
					// Handle successful uploads on complete
					// For instance, get the download URL: https://firebasestorage.googleapis.com/...
					getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
						await updateProfile(res.user, {
							displayName,
							photoURL: downloadURL,
						});
						await setDoc(doc(db, "users", res.user.uid), {
							uid: res.user.uid,
							displayName,
							email,
							photoURL: downloadURL,
						});
						await setDoc(doc(db, "userChats", res.user.uid), {});
						navigate("/");
					});
				}
			);
		} catch (err) {
			setErr(true);
		}
	};
	document.title = "Registrasi";
	return (
		<div className="formContainer">
			<div className="formWrapper">
				<span className="logo">UniTalks</span>
				<span className="title">Registrasi</span>
				<form onSubmit={handleSubmit}>
					<div className="formInput">
						<span>Username</span>
						<input type="text" />
					</div>
					<div className="formInput">
						<span>Email</span>
						<input type="email" />
					</div>
					<div className="formInput">
						<span>Password</span>
						<input type="password" />
					</div>
					<div className="formInput">
						<label htmlFor="file">
							<FontAwesomeIcon icon={faImage} size="xl" />
							&nbsp; {selectedFile ? selectedFile.name : "Add Avatar"}
						</label>
						<input
							style={{ display: "none" }}
							type="file"
							id="file"
							onChange={handleFileChange}
						/>
					</div>
					<div className="formRedirect">
						<button>Register</button>
						{err && <span>Registrasi Gagal, Coba Lagi!</span>}
						<p>
							Sudah punya akun?{" "}
							<span className="redirectLink">
								<Link to="/login">Login</Link>
							</span>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Register;
