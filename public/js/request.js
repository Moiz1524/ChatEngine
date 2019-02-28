function send_request(from,to){
	$.post("/add_friend",{from:from,to:to},function(data,status){
		location.reload();
	});
};

// function to get friend request response
function respond_request(from,to,ans){
	$.post("/respond_request",{from:from,to:to,ans:ans},function(data,status){
		if(ans === "Accept")
			location.reload();
		else
			window.location = "/";
	});
};

// function inArray(friends, ) {
//
// };
