const socket = io();

const $joinForm = document.querySelector("#join-form");
const $usernameInput = document.querySelector("#username");
const $roomInput = document.querySelector("#room");
const $liveRooms = document.querySelector("#live-rooms");
const $tooltip = document.querySelector("#tooltip");

const liveRoomsTemplate = document.querySelector("#live-rooms-template")
	.innerHTML;

socket.on("rooms", (rooms) => {
	if (rooms.length > 0) {
		const html = Mustache.render(liveRoomsTemplate, {
			rooms,
		});
		$liveRooms.innerHTML = html;
	}
});

socket.on("users", (users) => {
	document.getElementById("join").addEventListener("click", (e) => {
		const username = $usernameInput.value;
		const room = $roomInput.value;
		const existingUser = users.find((user) => {
			return user.room === room && user.username === username;
		});
		if (existingUser) {
			e.preventDefault();
			$usernameInput.style.border = "1px solid rgba(253, 44, 44, 0.904)";
			$tooltip.classList.remove("tooltip");
		} else {
			$joinForm.action = "./chat.html";
		}
	});
});

function selectRoom(e) {
	$roomInput.value = e.target.value;
}
