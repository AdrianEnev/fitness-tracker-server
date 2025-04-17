const generateID = () => {
    // generate ID that would resemble what firebase would generate
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default generateID;