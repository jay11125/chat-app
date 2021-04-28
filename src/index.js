const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const { generateMessage } = require("./utils/messages");
const {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
	getRooms,
	getAllUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
	console.log("New WebSocket connection");

	io.emit("rooms", getRooms());
	io.emit("users", getAllUsers());

	socket.on("join", ({ username, room }) => {
		const { user } = addUser({ id: socket.id, username, room });

		socket.join(user.room);
		socket.emit("message", generateMessage("Admin", "Welcome!"));
		socket.broadcast
			.to(user.room)
			.emit(
				"message",
				generateMessage("Admin", `${user.username} has joined!`)
			);

		io.to(user.room).emit("roomData", {
			room: user.room,
			users: getUsersInRoom(user.room),
		});

		// callback();
	});

	socket.on("sendMessage", (message, callback) => {
		const user = getUser(socket.id);
		io.to(user.room).emit("message", generateMessage(user.username, message));
		callback();
	});

	socket.on("location", (coords, callback) => {
		const user = getUser(socket.id);

		io.to(user.room).emit(
			"locationMessage",
			generateMessage(
				user.username,
				`https://google.com/maps/?q=${coords.latitude},${coords.longitude}`
			)
		);
		callback();
	});

	socket.on("disconnect", () => {
		const user = removeUser(socket.id);
		if (user) {
			io.to(user.room).emit(
				"message",
				generateMessage("Admin", `${user.username} has left!`)
			);
			io.to(user.room).emit("roomData", {
				room: user.room,
				users: getUsersInRoom(user.room),
			});
		}
	});
});

server.listen(port, () => {
	console.log(`Server is up on port ${port}!`);
});
