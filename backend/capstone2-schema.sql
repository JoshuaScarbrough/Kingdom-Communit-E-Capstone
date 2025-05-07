-- Users
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username VARCHAR(20) UNIQUE NOT NULL,
    userPassword TEXT NOT NULL DEFAULT 'admin',
    bio TEXT,
    userAddress TEXT,
    profilePictureURL TEXT DEFAULT 'https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small_2x/default-avatar-profile-icon-of-social-media-user-vector.jpg',
    coverPhotoURL TEXT DEFAULT 'https://biocare.net/wp-content/uploads/background1.jpg'
);

-- Following/Followers (Many to Many relationship)
CREATE TABLE followers(
    follower_ID INTEGER REFERENCES users(id),
    following_ID INTEGER REFERENCES users(id),
    PRIMARY KEY (following_ID, follower_ID)
);

-- Posts (One to many relationship)
CREATE TABLE posts(
    id SERIAL PRIMARY KEY,
    user_ID INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post TEXT NOT NULL,
    imageURL TEXT, 
    datePosted DATE DEFAULT CURRENT_DATE,
    timePosted TIME DEFAULT CURRENT_TIME,
    numLikes INTEGER DEFAULT 0,
    numComments INTEGER DEFAULT 0
);

-- User to posts liked relationship
CREATE TABLE postsLiked(
    user_ID INTEGER REFERENCES users(id),
    post_ID INTEGER REFERENCES posts(id),
    PRIMARY KEY (user_ID, post_ID)
);

CREATE TABLE urgentPosts(
    id SERIAL PRIMARY KEY,
    user_ID INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post TEXT NOT NULL,
    imageURL TEXT, 
    userLocation TEXT,
    datePosted DATE DEFAULT CURRENT_DATE,
    timePosted TIME DEFAULT CURRENT_TIME,
    numComments INTEGER DEFAULT 0
);

-- Events
CREATE TABLE events(
    id SERIAL PRIMARY KEY,
    user_ID INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post TEXT NOT NULL,
    imageURL TEXT, 
    userLocation TEXT,
    datePosted DATE DEFAULT CURRENT_DATE,
    timePosted TIME DEFAULT CURRENT_TIME,
    numLikes INTEGER DEFAULT 0,
    numComments INTEGER DEFAULT 0
);

-- User to events liked relationship
CREATE TABLE eventsLiked(
    user_ID INTEGER REFERENCES users(id),
    event_ID INTEGER REFERENCES events(id),
    PRIMARY KEY (user_ID, event_ID)
);


-- Messages
CREATE TABLE messages(
    id SERIAL PRIMARY KEY,
    user_ID INTEGER NOT NULL REFERENCES users(id),
    deliveredTo_ID INTEGER NOT NULL REFERENCES users(id),
    userMessage TEXT NOT NULL,
    dateSent DATE DEFAULT CURRENT_DATE,
    timeSent TIME DEFAULT CURRENT_TIME
);


-- Comments
CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    user_ID INTEGER NOT NULL REFERENCES users(id),
    post_ID INTEGER REFERENCES posts(id),
    urgentPost_ID INTEGER REFERENCES urgentPosts(id),
    event_ID INTEGER REFERENCES events(id),
    message_ID INTEGER REFERENCES messages(id),
    comment TEXT NOT NULL,
    datePosted DATE DEFAULT CURRENT_DATE,
    timePosted TIME DEFAULT CURRENT_TIME
);

