const users = [];

const addUser = ({ id, username, room }) => {
	username = username.trim().toLowerCase();
	room = room.trim().toLowerCase();

	const user = { id, username, room };
	users.push(user);
	return { user };
};

const getRooms = () => {
	const room = users.map((user) => {
		return user.room;
	});
	const roomArray = [...new Set(room)];
	return roomArray;
};

const removeUser = (id) => {
	const index = users.findIndex((user) => user.id === id);

	if (index !== -1) {
		return users.splice(index, 1)[0];
	}
};

const getUser = (id) => {
	return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
	room = room.trim().toLowerCase();
	return users.filter((user) => user.room === room);
};

const getAllUsers = () => users;

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom,
	getRooms,
	getAllUsers,
};
