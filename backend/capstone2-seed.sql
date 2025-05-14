-- Creating users
INSERT INTO users
    (username,
    userPassword, 
    userAddress
    )
VALUES
    ('CarlSamp', 'passwordOne', '3784 Us Highway 431 N Phenix City, AL 36867'),
    ('RebeccaPurple', 'passwordTwo', '1409 US-280, Phenix City, AL 36867'),
    ('DennisMen', 'passwordThree', '1100 Broadway, Columbus, GA, United States, Georgia'),
    ('MommaLucy', 'passwordFour',  '3909 hwy 80 Phenix City Al 36870, Phenix City, AL'),
    ('GodSon2001', 'passwordFive', '4225 University Ave, Columbus, GA'),
    ('ILuvGod', 'passwordSix', '2444 W Britt David Rd, Columbus, GA');


-- Sets followers / following relationship
INSERT INTO followers
    (follower_ID,
    following_ID
    )
VALUES
    (1,2),
    (1,3),
    (1,6),
    (2,1),
    (2,2),
    (2,4),
    (3,1),
    (3,2),
    (3,4),
    (3,5),
    (3,6),
    (4,1),
    (4,4),
    (4,5),
    (4,6),
    (5,1),
    (5,3),
    (5,4),
    (6,2),
    (6,3),
    (6,4),
    (6,5);

-- Sample Posts
INSERT INTO posts
    (user_ID, 
    post
    )
VALUES
    (1, 'Ahh such a beautiful day outside'),
    (1, 'I need more sleeeeeep!!'),
    (2, 'Jesus has Risen!!'),
    (3, 'This is the day that the Lord has made'),
    (4, 'I do not believe in this Jesus guy. Any help on knowing who he is???'),
    (5, 'Fresh out da Dentist');


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
    (4,2),
    (5,2),
    (5,3),
    (5,4),
    (6,1),
    (6,2),
    (6,5);

-- Sample Post Comments
INSERT INTO comments
    (user_ID, 
    post_ID,  
    comment
    )
VALUES
    (2,1, 'Yes it could not be any more perfect'),
    (3,1, 'Make sure you wear sunscreen'),
    (4,2, 'Try taking a quick nap'),
    (1,3, 'Yes he is the King!!'),
    (2,3, 'Hallulegh'),
    (5,3, 'Feel that one in my soul'),
    (6,4, 'I needed to hear this one today'),
    (6,5, 'Jesus is a person too... talk to him'),
    (1,5, 'Relationship not Religion'),
    (2,5, 'You can come over to my house and we can talk about it??'),
    (4,6, 'Those new teeth lookin cleannnn');


-- Sample Events
INSERT INTO events
    (user_ID, 
    post, 
    userLocation, 
    datePosted, 
    timePosted 
    )
VALUES
    (1, 'Come out to my 21st Birthday Party', ' 727 54th St, Columbus, GA 31904', '04/22/25', '07:15 PM'),
    (2, 'Graduation Time People', ' 7300 Whittlesey Blvd, Columbus, GA 31909', '04/22/25', '07:15 PM'),
    (5, 'Night of prayer and worship', '3617 Macon Rd, Columbus, GA 31907', '04/22/25', '07:15 PM'),
    (4, 'Celebrity Basketball game', '1-25 11th St, Columbus, GA 31901', '04/22/25', '07:15 PM');

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
    (4,2),
    (5,1),
    (5,2),
    (5,3),
    (5,4),
    (6,4);

-- Sample Event Comments
INSERT INTO comments
    (user_ID, 
    event_ID,  
    comment
    )
VALUES
    (1,1, 'Lets have some funnn'),
    (3,1, 'I will definitly be there'),
    (4,2, 'I love graduation parties'),
    (1,3, 'I am coming!!! I really need this'),
    (2,3, 'Thank you for impacting the community'),
    (6,3, 'Can someone give me a ride??');


-- Sample User Urgent Posts
INSERT INTO urgentPosts
    (user_ID, 
    post,
    imageURL, 
    userLocation
    )
VALUES
    (2, 'Help my car just broke down on the way to work!', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVOa6mAQOQrzGpQODmfsLVo80PbkBnaJD2hw&s', '2090 Highway 280/431, Phenix City, AL'),
    (3, 'Can anyone help me move last minute. I had a person cancel and I need some help.', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVOa6mAQOQrzGpQODmfsLVo80PbkBnaJD2hw&s', '7206 Schomburg Road, Columbus, Georgia'),
    (4, 'I am starving and I feel like giving up', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVOa6mAQOQrzGpQODmfsLVo80PbkBnaJD2hw&s', '1400 Whitewater Ave, Phenix City, Alabama,'),
    (6, 'Help my cat is stuck in a tree and I really do not want her to die', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVOa6mAQOQrzGpQODmfsLVo80PbkBnaJD2hw&s', '3206 Thornberry Circle Phenix City AL'),
    (1, 'This is very URGENT', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVOa6mAQOQrzGpQODmfsLVo80PbkBnaJD2hw&s', '7206 Schomburg Road, Columbus, Georgia');

-- Sample Urgent Posts Comments
INSERT INTO comments
    (user_ID, 
    urgentPost_ID,  
    comment
    )
VALUES
    (1,1, 'What is the problem with it??'),
    (3,1, 'Is it a tire?'),
    (4,2, 'Do not worry hunny me and my boys will be there'),
    (1,3, 'Call me so we can pray (205-718- 1659)'),
    (2,3, 'I am close to you. Do you want to grab some dinner with me?'),
    (5,4, 'I have been waiting for this moment my entire life'),
    (1,5, 'Can you give some more details??');



-- Sample Messages
-- INSERT INTO messages
--     (user_ID,
--     deliveredTo_ID,
--     userMessage
--     )
-- VALUES
--     (1,2,'Hello I would like to connect with you'),
--     (1,2,'My name is TestUser'),
--     (1,2,'I am THE first test user'),
--     (2,1, 'Nice to meet you'),
--     (2,1, 'I am the second version of you'),
--     (1,2, 'Oh really'),
--     (2,1, 'Yes... The better version');
