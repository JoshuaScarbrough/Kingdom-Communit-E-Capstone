-- Creating users
INSERT INTO users
    (username, 
    firstName, 
    lastName, 
    userAddress
    )
VALUES
    ('testUser', 'test', 'User', '123 test Street, Test City, AL'),
    ('testUser2', 'test', 'User2', '213 test Street, Test City, AL'),
    ('testUser3', 'test', 'User3', '312 test Street, Test City, AL'),
    ('testUser4', 'test', 'User4', '321 test Street, Test City, AL');


-- Sets followers / following relationship
INSERT INTO followers
    (follower_ID,
    following_ID
    )
VALUES
    (1,2),
    (1,3),
    (2,1),
    (2,4),
    (3,1),
    (3,2),
    (3,4),
    (4,1);

-- Sample Posts
INSERT INTO posts
    (user_ID, 
    post,  
    datePosted, 
    timePosted
    )
VALUES
    (1, 'Post one', '04/14/25','11:15 AM'),
    (2, 'Post two', '04/14/25','11:18 AM'),
    (3, 'Post three', '04/14/25','11:15 AM'),
    (4, 'Post four', '04/14/25','11:15 AM');



-- User posts Liked 
INSERT INTO postsLiked
    (user_ID,
    post_ID
    )
VALUES
    (1,2),
    (1,3),
    (1,4),
    (2,1),
    (2,3),
    (3,1),
    (3,2),
    (3,4),
    (4,1),
    (4,2);


-- Sample User Urgent Posts
INSERT INTO urgentPosts
    (user_ID, 
    post,
    imageURL, 
    userLocation, 
    datePosted, 
    timePosted 
    )
VALUES
    (2, 'Urgent One', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVOa6mAQOQrzGpQODmfsLVo80PbkBnaJD2hw&s', '123 im in trouble street, Test City, AL', '04/20/25', '01:10 PM'),
    (3, 'Urgent Two', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVOa6mAQOQrzGpQODmfsLVo80PbkBnaJD2hw&s', '213 im in trouble street, Test City, AL', '04/20/25', '01:10 PM'),
    (4, 'Urgent Three', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVOa6mAQOQrzGpQODmfsLVo80PbkBnaJD2hw&s', '312 im in trouble street, Test City, AL', '04/20/25', '01:10 PM');


-- Sample Events
INSERT INTO events
    (user_ID, 
    post, 
    userLocation, 
    datePosted, 
    timePosted 
    )
VALUES
    (1, 'Event One', 'Event location place', '04/22/25', '07:15 PM'),
    (2, 'Event Two', 'Event location place', '04/22/25', '07:15 PM'),
    (4, 'Event Three', 'Event location place', '04/22/25', '07:15 PM'),
    (4, 'Event Four', 'Event location place', '04/22/25', '07:15 PM');

-- User Events Liked 
INSERT INTO eventsLiked
    (user_ID,
    event_ID
    )
VALUES
    (1,2),
    (1,3),
    (1,4),
    (2,1),
    (2,3),
    (3,1),
    (3,2),
    (3,4),
    (4,1),
    (4,2);

-- Sample Messages
INSERT INTO messages
    (user_ID,
    deliveredTo_ID,
    userMessage
    )
VALUES
    (1,2,'Hello I would like to connect with you'),
    (1,2,'My name is TestUser'),
    (1,2,'I am THE first test user'),
    (2,1, 'Nice to meet you'),
    (2,1, 'I am the second version of you'),
    (1,2, 'Oh really'),
    (2,1, 'Yes... The better version');

-- Sample Post Comments
INSERT INTO comments
    (user_ID, 
    post_ID,  
    comment, 
    datePosted, 
    timePosted)
VALUES
    (2,1, 'sample comment', '04/20/25', '10:11 AM'),
    (3,1, 'sample comment', '04/20/25', '10:11 AM'),
    (4,1, 'sample comment', '04/20/25', '10:11 AM');

-- Sample Event Comments
INSERT INTO comments
    (user_ID, 
    event_ID,  
    comment, 
    datePosted, 
    timePosted)
VALUES
    (1,2, 'sample comment', '04/20/25', '10:11 AM'),
    (3,2, 'sample comment', '04/20/25', '10:11 AM'),
    (4,2, 'sample comment', '04/20/25', '10:11 AM');
