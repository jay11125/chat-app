const socket = io();

const $messageInput = document.querySelector("#message");
const $messageButton = document.querySelector("#send-message");
const $locationButton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");
const $sidebar = document.querySelector("#sidebar");

const messageTemplate = document.querySelector("#message-template").innerHTML;
const locationTemplate = document.querySelector("#location-template").innerHTML;
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const { username, room } = Qs.parse(location.search, {
	ignoreQueryPrefix: true,
});

const autoscroll = () => {
	// New message element
	const $newMessage = $messages.lastElementChild;

	// Height of the new message
	const newMessageStyles = getComputedStyle($newMessage);
	const newMessageMargin = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

	// Visible height
	const visibleHeight = $messages.offsetHeight;

	// Height of messages container
	const containerHeight = $messages.scrollHeight;

	// How far have I scrolled?
	const scrollOffset = $messages.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight;
	}
};

socket.on("message", (message) => {
	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format("h:mm a"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoscroll();
});

socket.on("locationMessage", (message) => {
	const html = Mustache.render(locationTemplate, {
		username: message.username,
		url: message.text,
		createdAt: moment(message.createdAt).format("h:mm a"),
	});
	$messages.insertAdjacentHTML("beforeend", html);
	autoscroll();
});

socket.on("roomData", ({ users, room }) => {
	const html = Mustache.render(sidebarTemplate, {
		room,
		users,
	});
	$sidebar.innerHTML = html;
});

$messageButton.addEventListener("click", (e) => {
	e.preventDefault();

	$messageButton.setAttribute("disabled", "disabled");
	const message = document.getElementById("message").value;

	socket.emit("sendMessage", message, () => {
		$messageButton.removeAttribute("disabled");
		$messageInput.value = "";
		$messageInput.focus();
	});
});

$locationButton.addEventListener("click", (e) => {
	e.preventDefault();
	if (!navigator.geolocation) {
		return alert("Your Browser does not support Geolocation");
	}

	$locationButton.setAttribute("disabled", "disabled");

	navigator.geolocation.getCurrentPosition((position) => {
		socket.emit(
			"location",
			{
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,
			},
			() => {
				$locationButton.removeAttribute("disabled");
			}
		);
	});
});

socket.emit("join", { username, room });
