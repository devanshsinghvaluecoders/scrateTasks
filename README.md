Task:

1)to run the project npm start  2) i had used various library such as express,mongoose,ObjectId,cors

1)users/new:
type:post
body:{
"userName":"name"
}
example:{
"userName":"devnash"
}
this api is use to create the user with the help of userName

2)user/all:
type:get
this api returns all users.

3)/meetings/new
type:post
body{
uid1:"_id of user1",
uid2:"_id of user2",
date:"date of meeting"
}
example:{
uid1:"61bb32d1711bb657b8207d9e",
uid2:"61bb3b3392faad2cf0626224"
date:"12/02/22"
}
this api crate a  session for metting between 2 users

4)/meetings/all:
type:get
this api is use to get the data of all metting.
