import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export const Login = () => {
	const [err, setErr] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		const email = e.target[0].value;
		const password = e.target[1].value;

		//console.log(username, email, password);
		try {
			await signInWithEmailAndPassword(auth, email, password);
			navigate("/");
		} catch (err) {
			setErr(true);
		}
	};
	document.title = "Login";
	return (
		<div className="formContainer">
			<div className="formWrapper">
				<span className="logo">UniTalks</span>
				<span className="title">Login</span>
				<form onSubmit={handleSubmit}>
					<div className="formInput">
						<span>Email</span>
						<input type="email" />
					</div>
					<div className="formInput">
						<span>Password</span>
						<input type="password" />
					</div>
					<div className="formRedirect">
						<button>Login</button>
						{err && <span>Login Gagal, Coba Lagi!</span>}
						<p>
							Belum punya akun?{" "}
							<span className="redirectLink">
								<Link to="/register">Registrasi</Link>
							</span>
						</p>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;
