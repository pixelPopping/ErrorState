import { useEffect, useState } from "react";
import { UserDetail } from "./UserDetail";
import { UserForm } from "./UserForm";

const App = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/users");
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
        const friends = await response.json();
        setUsers(friends);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchUsers();
  }, []);

  const createUser = async (user) => {
    // No error handling, normally you would do that.
    const response = await fetch("http://localhost:3000/users", {
      method: "POST",
      body: JSON.stringify(user),
      headers: { "Content-Type": "application/json;charset=utf-8" },
    });
    user.id = (await response.json()).id;
    setUsers(users.concat(user));
  };

  return (
    <div className="App">
      <h1>React Hooks exercise starter</h1>
      <UserForm createUser={createUser} />
      <ul>
        {users.map((user) => (
          <li onClick={() => setSelectedUser(user)} key={user.id}>
            {user.name}
          </li>
        ))}
      </ul>
      {selectedUser && <UserDetail user={selectedUser} />}
    </div>
  );
};

export default App;
