import { signOut } from "firebase/auth";
import React, { useContext, useState } from "react";
import { auth } from "../firebase";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const { currentUser } = useContext(AuthContext);

	const handleImageClick = () => {
		setDropdownOpen(!dropdownOpen);
	};

	const handleLogout = () => {
		// Implement logout logic here
		signOut(auth);
		// For now, let's just close the dropdown
		setDropdownOpen(false);
	};

	return (
		<div className="navbar">
			<span className="logo">UniTalks</span>
			<div className="user">
				<img src={currentUser.photoURL} onClick={handleImageClick} />
				{dropdownOpen && (
					<div id="myDropdown" className="dropdown-content">
						<span>{currentUser.displayName}</span>
						<button onClick={handleLogout}>Logout</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default Navbar;
