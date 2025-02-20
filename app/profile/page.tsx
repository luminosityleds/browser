import { useRouter } from 'next/navigation'; // Correct import for `useRouter`
import { useState } from 'react'; // Import `useState` from React
import axios from 'axios'; // Import Axios for making API requests

export default function ProfilePage() {
    const router = useRouter();
    const [data, setData] = useState("nothing");

    const getUserDetails = async () => {
        try {
            const res = await axios.get('/api/users/me');
            setData(res.data.data._id); // Ensure the response structure matches this path
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    return (
        <div>
            <h1>Profile</h1>
            <h2>{data === "nothing" ? "Nothing" : data}</h2> {/* Corrected this logic */}
            <button onClick={getUserDetails}>Details</button>
        </div>
    );
}
